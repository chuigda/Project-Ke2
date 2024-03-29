import io, json, sys, time
import chess
import chess.pgn
import chess.engine

cached_position_score = {}
book = {}
engine = chess.engine.SimpleEngine.popen_uci("/root/stockfish/stockfish")
engine.configure({
#    "UCI_AnalyseMode": True,
    "Threads": 8,
    "Hash": 8192
})

def add_line(line_pgn: str, eco: str, name: str):
    pgn_io = io.StringIO(line_pgn)
    line = chess.pgn.read_game(pgn_io)
    if line is None:
        print("ERROR:", line_pgn, "is not valid PGN, skipping", file=sys.stderr)
        return

    line_len = line.end().ply()
    line = line.game()
    prev_fen = ''
    prev_score = 0
    while line is not None:
        board = line.board()
        fen = board.fen()
        fen = fen.split(" ")
        # remove half-moves counter and full-moves counter
        fen = " ".join(fen[:4])

        if fen not in book:
            book[fen] = {
                "eco": eco,
                "name": name,
                "moves": {},
                "line_len": line_len
            }
        else:
            prev_node = book[fen]
            if prev_node["line_len"] > line_len:
                book[fen]["line_len"] = line_len
                book[fen]["eco"] = eco
                book[fen]["name"] = name

        if fen in cached_position_score:
            score = cached_position_score[fen]
        else:
            info = engine.analyse(board, chess.engine.Limit(depth=20))
            if "score" not in info:
                score = prev_score
            else:
                score = info["score"].white().score(mate_score=999)
            cached_position_score[fen] = score

        if line.move is not None:
            uci = line.move.uci()
            if uci not in book[prev_fen]["moves"]:
                score_diff = score - prev_score
                if line.turn() == chess.WHITE:
                    score_diff = -score_diff
                book[prev_fen]["moves"][uci] = score_diff

        prev_fen = fen
        prev_score = score
        line = line.next()

for tsv_file in ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"]:
    print("importing file:", tsv_file, file=sys.stderr)
    with open(tsv_file) as tsv:
        lines = tsv.readlines()[1:]
        for (i, line) in enumerate(lines):
            eco, name, pgn = line.split("\t")
            print(
                "[",
                i + 1,
                "/",
                len(lines),
                "] importing line: ",
                eco, ": ",
                name, ": ",
                pgn.removesuffix("\n"),
                sep="",
                end="",
                file=sys.stderr)
            sys.stderr.flush()
            start_time = time.time()
            add_line(pgn, eco, name)
            end_time = time.time()
            print(" took", str(end_time - start_time), file=sys.stderr)

engine.close()

for fen in book:
    del book[fen]["line_len"]

book["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"]["eco"] = ""
book["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"]["name"] = "Initial position"

with open("book.json", "w") as book_file:
    json.dump(book, book_file, indent=4)

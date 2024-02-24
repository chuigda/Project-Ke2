import chess
import chess.pgn
import chess.engine
import io

engine = chess.engine.SimpleEngine.popen_uci("C:\\Applications\\stockfish.exe")

pgn = io.StringIO("1. g4 d5")
game = chess.pgn.read_game(pgn)
if game is None:
    print("Error parsing the game")
    exit(-1)

game = game.game()

while game is not None:
    board = game.board()
    fen = board.fen()
    info = engine.analyse(board, chess.engine.Limit(depth=20))
    score = info["score"].white().score(mate_score = 999)

    if game.move:
        print("move=", game.move.uci(), sep="")
    print("fen=", fen, ", eval=", score, sep="")
    game = game.next()

engine.close()

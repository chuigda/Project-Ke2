import { Chess, Square } from 'chess.js'
import { PlayerSide, PieceKind, ChessboardFiles } from './def'
import { OpeningBook } from './opening'
import { Ref, ref } from './ref'

export const PieceValue: Record<PieceKind, number> = {
    'k': 99999,
    'q': 900,
    'b': 310,
    'n': 290,
    'r': 500,
    'p': 100
}

// Since king also can take a part in the battle, we give it a value
export const KingTacticalValue: number = 350

export const SquareControlTacticalValue: number = 12.5

export const SquarePositionalValueWhite: number[][] = [
    [0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.8],
    [0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9],
    [1.0, 1.0, 1.05, 1.05, 1.05, 1.05, 1.0, 1.0],
    [1.0, 1.0, 1.1, 1.15, 1.15, 1.1, 1.0, 1.0],
    [1.0, 1.0, 1.1, 1.15, 1.15, 1.1, 1.0, 1.0],
    [1.0, 1.0, 1.05, 1.05, 1.05, 1.05, 1.0, 1.0],
    [1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05],
    [1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05]
]

export const SquarePositionalValue: Record<PlayerSide, number[][]> = {
    'w': SquarePositionalValueWhite,
    'b': SquarePositionalValueWhite.slice().reverse()
}

export function hceEvaluate(game: Chess, side: PlayerSide, withoutKing: boolean): number {
    if (!withoutKing && game.isCheckmate()) {
        if (side === game.turn()) {
            return -PieceValue['k']
        } else {
            return PieceValue['k']
        }
    }

    let whiteScore = 0
    let blackScore = 0

    for (let rank = 0; rank < 8; ++rank) {
        for (let file = 0; file < 8; ++file) {
            const square = `${ChessboardFiles[file]}${rank + 1}`
            // const linearIdx = rank * 8 + file

            // piece value evaluation
            const piece = game.get(<Square>square)
            if (!piece) {
                continue
            }

            const { color, type } = piece

            let pieceValue
            switch (type) {
                case 'p': pieceValue = PieceValue['p']; break
                case 'n': pieceValue = PieceValue['n']; break
                case 'b': pieceValue = PieceValue['b']; break
                case 'r': pieceValue = PieceValue['r']; break
                case 'q': pieceValue = PieceValue['q']; break
                case 'k': {
                    // if only one side has king, the checkmate rule actually doesn't apply
                    // so we use the actual "tactical" value of the king (the power of the king)
                    if (withoutKing) {
                        pieceValue = KingTacticalValue
                    } else {
                        // otherwise, king is value-less. The actual evaluation will be done
                        // by checkmate rule.
                        pieceValue = 0
                    }
                }
            }

            if (color === 'w') {
                whiteScore += pieceValue
            } else {
                blackScore += pieceValue
            }

            // positional advantage evaluation, we give 20 centipawn for each square
            // under control
            if (game.isAttacked(<Square>square, 'w')) {
                whiteScore += SquareControlTacticalValue * SquarePositionalValue['w'][rank][file]
            }

            if (game.isAttacked(<Square>square, 'b')) {
                blackScore += SquareControlTacticalValue * SquarePositionalValue['b'][rank][file]
            }
        }
    }

    if (side === 'w') {
        return whiteScore - blackScore
    } else {
        return blackScore - whiteScore
    }
}

export function findMoves(
    game: Chess,
    withoutKing: boolean,
    depth: number,
    counter: Ref<number>
): [string, number][] {
    const fen = game.fen()
    const fenWithoutMoveCounter = fen.split(' ').slice(0, 4).join(' ')
    if (OpeningBook[fenWithoutMoveCounter]) {
        const bookMoves = OpeningBook[fenWithoutMoveCounter].moves
        if (bookMoves.length != 0) {
            return bookMoves
        }
    }

    const currentSide = game.turn()
    const currentScore = hceEvaluate(game, currentSide, withoutKing)

    const moves = game.moves({ verbose: true })
    const scores: [string, number][] = []

    for (const move of moves) {
        game.move(move)
        const score = dfsEvaluatePosition(currentSide, game, withoutKing, depth, counter)
        const scoreDiff = score - currentScore
        game.undo()

        scores.push([move.lan, scoreDiff])
    }

    scores.sort((a, b) => b[1] - a[1])
    return scores
}

export function dfsEvaluatePosition(
    playerSide: PlayerSide,
    game: Chess,
    withoutKing: boolean,
    depth: number,
    counter: Ref<number>
): number {
    counter.value += 1

    if (depth === 0) {
        return hceEvaluate(game, playerSide, true)
    }

    if (!withoutKing && game.isCheckmate()) {
        if (playerSide === game.turn()) {
            return -PieceValue['k']
        } else {
            return PieceValue['k']
        }
    }

    if (game.isDraw()) {
        return 0
    }

    const moves = game.moves({ verbose: true })
    const scores = []
    for (const move of moves) {
        game.move(move)
        const score = dfsEvaluatePosition(playerSide, game, withoutKing, depth - 1, counter)
        game.undo()
        scores.push(score)
    }

    if (scores.length === 0) {
        return 0
    }

    if (game.turn() === playerSide) {
        return Math.max(...scores)
    } else {
        return Math.min(...scores)
    }
}

export function findOneMove(
    game: Chess,
    withoutKing: boolean,
    depth: number,
    cplTolerance: number,
    counter? : Ref<number>
): [string, number] {
    if (!counter) {
        counter = ref(0)
    }

    const moves = findMoves(game, withoutKing, depth, counter)

    if (cplTolerance <= 0) {
        return moves[0]
    } else {
        const bestMoveValue = moves[0][1]
        const okMoves = moves.filter(([, value]) => value >= bestMoveValue - cplTolerance)

        if (okMoves.length === 0) {
            return moves[0]
        } else {
            return okMoves[Math.floor(Math.random() * okMoves.length)]
        }
    }
}

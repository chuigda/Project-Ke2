import { Chess, Square } from 'chess.js'
import { PlayerSide, PieceKind, ChessboardFiles } from './def'
import { OpeningBook } from './opening'

export const PieceValue: Record<PieceKind, number> = {
    'k': 99999,
    'q': 900,
    'b': 310,
    'n': 290,
    'r': 500,
    'p': 100
}

// Since king also can take a part in the battle, we give it a value
export const KingTacticalValue = 3.5

// knight and bishop are centre-sentive, they control more squares
// as they get closer to the centre. The value is defined by the
// squares they control / the squares they could control at the
// centre.
export const KnightValueMap: number[] = [
    0.25, 0.375, 0.5, 0.5, 0.5, 0.5, 0.375, 0.25,
    0.375, 0.5, 0.75, 0.75, 0.75, 0.75, 0.5, 0.375,
    0.5, 0.75, 1, 1, 1, 1, 0.75, 0.5,
    0.5, 0.75, 1, 1, 1, 1, 0.75, 0.5,
    0.5, 0.75, 1, 1, 1, 1, 0.75, 0.5,
    0.5, 0.75, 1, 1, 1, 1, 0.75, 0.5,
    0.375, 0.5, 0.75, 0.75, 0.75, 0.75, 0.5, 0.375,
    0.25, 0.375, 0.5, 0.5, 0.5, 0.5, 0.375, 0.25
].map(x => x * 1.1)

export const BishopValueMap: number[] = [
    0.5384, 0.5384, 0.5384, 0.5384, 0.5384, 0.5384, 0.5384, 0.5384,
    0.5384, 0.6923, 0.6923, 0.6923, 0.6923, 0.6923, 0.6923, 0.5384,
    0.5384, 0.6923, 0.8462, 0.8462, 0.8462, 0.8462, 0.6923, 0.5384,
    0.5384, 0.6923, 0.8462, 1, 1, 0.8462, 0.6923, 0.5384,
    0.5384, 0.6923, 0.8462, 1, 1, 0.8462, 0.6923, 0.5384,
    0.5384, 0.6923, 0.8462, 0.8462, 0.8462, 0.8462, 0.6923, 0.5384,
    0.5384, 0.6923, 0.6923, 0.6923, 0.6923, 0.6923, 0.6923, 0.5384,
    0.5384, 0.5384, 0.5384, 0.5384, 0.5384, 0.5384, 0.5384, 0.5384,
].map(x => x * 1.1)

// rook is centre-insensitive, it controls the same number of squares
// no matter where it is placed. We just give a value of 0.5 for rooks'
// initial position, encouraging them to move to the centre. Also seventh
// rank is given more value, because rook is dominating there.
export const RookValueMap: Record<PlayerSide, number[]> = {
    'w': [
        0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.1, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.1,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
    ],
    // reversed for black
    'b': [
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.1, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.1,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5
    ]
}

function impHceEvaluate(game: Chess, side: PlayerSide, withoutKing: boolean): number {
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
            const linearIdx = rank * 8 + file

            const { color, type } = game.get(<Square>square)

            let pieceValue
            switch (type) {
                case 'p': pieceValue = PieceValue['p']; break
                case 'n': pieceValue = PieceValue['n'] * KnightValueMap[linearIdx]; break
                case 'b': pieceValue = PieceValue['b'] * BishopValueMap[linearIdx]; break
                case 'r': pieceValue = PieceValue['r'] * RookValueMap[color][linearIdx]; break
                case 'q': pieceValue = PieceValue['q']; break
                case 'k': {
                    // if only one side has king, the checkmate rule actually doesn't apply
                    // so we use the actual "tactical" value of the king. It's estimated
                    // 3.5~4 points
                    if (withoutKing) {
                        pieceValue = 3.5
                    } else {
                        pieceValue = KingTacticalValue
                    }
                }
            }

            if (color === 'w') {
                whiteScore += pieceValue
            } else {
                blackScore += pieceValue
            }
        }
    }

    if (side === 'w') {
        return whiteScore - blackScore
    } else {
        return blackScore - whiteScore
    }
}

// the game engine could evaluate positions without kings, this is very useful for some
// mini games
export function hceEvaluate(fen: string, side: PlayerSide, withoutKing: boolean): number {
    const game = new Chess()
    game.load(fen, { skipValidation: withoutKing })

    return impHceEvaluate(game, side, withoutKing)
}

export function impFindMoves(game: Chess, fen?: string): [string, number][] {
    if (!fen) {
        fen = game.fen()
    }

    const fenWithoutMoveCounter = fen.split(' ').slice(0, 4).join(' ')
    if (OpeningBook[fenWithoutMoveCounter]) {
        return OpeningBook[fenWithoutMoveCounter].moves
    }

    const currentSide = game.turn()
    const currentScore = impHceEvaluate(game, currentSide, false)

    const moves = game.moves()
    const scores: [string, number][] = []

    for (const move of moves) {
        game.move(move)
        const score = impHceEvaluate(game, currentSide, false)
        const scoreDiff = score - currentScore

        scores.push([move, scoreDiff])
    }

    scores.sort((a, b) => b[1] - a[1])
    return scores
}

export function findMoves(fen: string): [string, number][] {
    const game = new Chess()
    game.load(fen)

    return impFindMoves(game, fen)
}

export function findOneMove(fen: string): [string, number] {
    const scores = findMoves(fen)
    
    if (scores.length === 0) {
        return ['', 0]
    }

    // randomly pick a move that is not a blunder (centipawn - 250)
    const blunderThreshold = -250
    const nonBlunders = scores.filter(x => x[1] > blunderThreshold)
    // if in zugzwang, just do our
    if (nonBlunders.length === 0) {
        return scores[0]
    }

    // pick one from the non-blunders
    return nonBlunders[Math.floor(Math.random() * nonBlunders.length)]
}

export function impFindOneMove(game: Chess, fen?: string): [string, number] {
    const moves = impFindMoves(game, fen)

    if (moves.length === 0) {
        return ['', 0]
    }

    // randomly pick a move that is not a blunder (centipawn - 250)
    const blunderThreshold = -250
    const nonBlunders = moves.filter(x => x[1] > blunderThreshold)
    // if in zugzwang, just do our
    if (nonBlunders.length === 0) {
        return moves[0]
    }

    // pick one from the non-blunders
    return nonBlunders[Math.floor(Math.random() * nonBlunders.length)]
}

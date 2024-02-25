import { Chess, Square } from 'chess.js'
import { PlayerSide, PieceKind, ChessboardFiles } from './def'

export const PieceValue: Record<PieceKind, number> = {
    'k': 999.99,
    'q': 9,
    'b': 3.1,
    'n': 2.9,
    'r': 5,
    'p': 1
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

// the game engine could evaluate positions without kings, this is very useful for some
// mini games
export function hceEvaluate(fen: string, side: PlayerSide, withoutKing: boolean): number {
    const game = new Chess()
    game.load(fen, { skipValidation: withoutKing })

    if (game.isCheckmate()) {
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

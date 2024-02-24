import { Chess } from 'chess.js'
import { PlayerSide, PieceKind } from './def'

export const PieceValue: Record<PieceKind, number> = {
    'king': 999.99,
    'queen': 9,
    'bishop': 3.2,
    'knight': 3,
    'rook': 5,
    'pawn': 1
}

export function hceEvaluate(fen: string, side: PlayerSide): number {
}

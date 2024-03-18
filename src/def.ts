import { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE, BLACK } from 'chess.js'

export type PlayerSide = typeof WHITE | typeof BLACK

export type PieceKind =
    typeof PAWN |
    typeof KNIGHT |
    typeof BISHOP |
    typeof ROOK |
    typeof QUEEN |
    typeof KING

export const ChessboardFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

type PieceKind = 'K' | 'Q' | 'B' | 'N' | 'R' | 'P'
type PieceSide = 'W' | 'B'

type Piece = [PieceKind, PieceSide]

interface Chessboard {
    board: Piece[]
    sideToMove: PieceSide
    castleRights: boolean[]
    enPassant?: [number, number]
}

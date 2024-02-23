type PieceKind = 'K' | 'Q' | 'B' | 'N' | 'R' | 'P'
type PieceSide = 'W' | 'B'

type Piece = [PieceKind, PieceSide] | null | undefined

interface Chessboard {
    board: Piece[]
    sideToMove: PieceSide
    castleRights: boolean[] // KQkq
    enPassant?: [number, number]
}

export function chessboardRef(cb: Chessboard, file: number, rank: number): Piece {
    const linearIndex = (7 - rank) * 8 + file
    return cb.board[linearIndex]
}

export function chessboardSet(cb: Chessboard, file: number, rank: number, piece: Piece) {
    const linearIndex = (7 - rank) * 8 + file
    cb.board[linearIndex] = piece
}

export function chessboard2fen(cb: Chessboard): string {
    let fen = ''

    for (let rank = 7; rank >= 0; rank--) {
        let emptySquares = 0

        for (let file = 0; file < 8; file++) {
            const piece = chessboardRef(cb, file, rank)

            if (!piece) {
                emptySquares++
                continue
            }

            if (emptySquares > 0) {
                fen += emptySquares
                emptySquares = 0
            }

            fen += piece2str(piece)
        }

        if (emptySquares > 0) {
            fen += emptySquares
        }

        if (rank > 0) {
            fen += '/'
        }
    }

    fen += ` ${cb.sideToMove.toLowerCase()} `
    fen += cb.castleRights.map((v, i) => (v ? 'KQkq'[i] : '')).join('')
    fen += cb.enPassant ? 'abcdefgh'[cb.enPassant[0]] + (cb.enPassant[1] + 1) : '-'

    return fen
}

function piece2str(piece: Piece): string {
    if (!piece) {
        return '.'
    }

    const [kind, side] = piece
    return side === 'W' ? kind : kind.toLowerCase()
}

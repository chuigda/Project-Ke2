import RawOpeningBook from "../opening-book/book.json"

export interface OpeningPosition {
    name: string
    eco: string
    moves: [string /* move */, number /* goodness */][]
}

export function initOpeningBook(): Record<string, OpeningPosition> {
    const ret: Record<string, OpeningPosition> = {}
    const rawOpeningBook: Record<string, {
        name: string,
        eco: string, moves: Record<string, number>
    }> = RawOpeningBook

    for (const fen in rawOpeningBook) {
        const { name, eco, moves } = rawOpeningBook[fen]
        const sortedMoves: [string, number][] = []
        for (const uci in moves) {
            const evalResult = moves[uci]
            sortedMoves.push([uci, evalResult])
        }

        sortedMoves.sort((a, b) => b[1] - a[1])
        ret[fen] = { name, eco, moves: sortedMoves }
    }

    return ret
}

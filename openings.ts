export interface OpeningPosition {
    name: string
    eco: string
    moves: [string /* move */, number /* goodness */][]
}

export default OpeningPosition

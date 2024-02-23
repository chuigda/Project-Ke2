export interface OpeningPosition {
    name: string
    eco: string
    moves: [string /* move */, number /* goodness */][]
}

const OpeningPositions: Record<string, OpeningPosition> = {
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR KQkq w -": {
        name: "Initial position",
        "eco": "",
        "moves": [
            ["e2e4", 1.0], // King's Pawn Opening
            ["d2d4", 1.0], // Queen's Pawn Opening
            ["g1f3", 0.9], // Reti Opening
            ["c2c4", 0.9], // English Opening
            ["b1c3", 0.8], // Vienna Game
            ["f2f4", 0.65], // Bird's Opening
            ["b2b4", 0.4], // Polish Opening
            ["g2g4", 0.4], // Grob's Opening
            ["h2h4", 0.2], // Kadas Opening
        ]
    },
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR KQkq -": {
        name: "King's Pawn Opening",
        "eco": "B00",
        "moves": [
            ["e7e5", 1.0], // King's Pawn Opening
            ["c7c5", 1.0], // Sicilian Defense
            ["d7d5", 0.9], // Scandinavian Defense
            ["g8f6", 0.9], // Petrov's Defense
            ["b8c6", 0.8], // Pirc Defense
            ["g7g6", 0.8], // Modern Defense
            ["e7e6", 0.8], // French Defense
            ["d7d6", 0.8], // Philidor Defense
            ["b7b6", 0.8], // Owen's Defense
            ["a7a6", 0.8], // Robatsch Defense
            ["h7h6", 0.8], // Pterodactyl Defense
            ["f7f6", 0.8], // Barnes Defense
            ["g7g5", 0.8], // Grob's Defense
            ["h7h5", 0.8], // St. George Defense
            ["a7a5", 0.8], // Ware Defense
            ["b7b5", 0.8], // Orangutan Defense
        ]
    },
}

export default OpeningPosition

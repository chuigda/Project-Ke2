import { Chess } from 'chess.js'
import { hceEvaluate } from '../hce_eval'

const game = new Chess()
game.move("e2e4")
game.move("c7c5")
game.move("g1f3")
game.move("d7d6")
game.move("d2d4")
game.move("c5d4")
game.move("f3d4")
game.move("g8f6")
game.move("b1c3")
game.move("a7a6") // Sicilian Defense, Najdorf Variation, Anti-English Variation
console.log(hceEvaluate(game, 'w', false))

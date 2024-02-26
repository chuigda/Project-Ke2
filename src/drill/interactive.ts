import { Chess } from 'chess.js'
import { findOneMove } from '../hce_eval'

// Node.js IO module
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const game = new Chess()

let depth = 2

// The main loop
async function main() {
    while (!game.isGameOver()) {
        console.log(game.ascii())
        const move = await askForMove()
        game.move(move)

        const startTime = Date.now()
        const hceMove = findOneMove(game, false, depth)
        const endTime = Date.now()
        console.log('evaluation took:', (endTime - startTime), 'HCE move found:', hceMove)
        game.move(hceMove[0])
    }
    console.log(game.ascii())
    console.log('Game over')
}

async function askForMove(): Promise<string> {
    return new Promise(resolve => {
        rl.question('Enter your move: ', answer => {
            resolve(answer)
        })
    })
}

main()

import { Chess } from 'chess.js'
import { findOneMove } from '../hce_eval'

import readline from 'readline'
import { ref } from '../ref'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const game = new Chess()

let depth = 2

async function main() {
    while (!game.isGameOver()) {
        console.log(game.ascii())
        const move = await askForMove()
        try {
            game.move(move)
        } catch (e) {
            console.error(`无效的着法: ${move}`)
            continue
        }

        const startTime = Date.now()
        const counter = ref(0)
        const hceMove = findOneMove(game, false, depth, 50, counter)
        const endTime = Date.now()
        console.log(`搜索了 ${counter.value} 个局面，用时 ${endTime - startTime}，选定着法 ${hceMove[0]}，分数 ${hceMove[1]}`)
        game.move(hceMove[0])
    }
    console.log(game.ascii())

    if (game.isCheckmate() && game.turn() === 'w') {
        console.log('你似了')
    } else if (game.isCheckmate() && game.turn() === 'b') {
        console.log('你赢了')
    } else {
        if (game.isStalemate()) {
            console.log('和棋，因为无子可动')
        } else if (game.isThreefoldRepetition()) {
            console.log('和棋，因为三次重复局面')
        } else {
            console.log('和棋，因为五十步无吃子')
        }
    }
}

async function askForMove(): Promise<string> {
    return new Promise(resolve => {
        rl.question('输入一个着法: ', answer => {
            resolve(answer)
        })
    })
}

main()

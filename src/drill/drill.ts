import { initOpeningBook } from "../opening"

const openingBook = initOpeningBook()

console.log("In total", Object.keys(openingBook).length, "positions in the opening book")

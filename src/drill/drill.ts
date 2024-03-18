import fs from "fs"
import { initOpeningBook } from '../opening'

const openingBook = initOpeningBook()

// save opening book to opening-book.json

fs.writeFileSync("opening-book.json", JSON.stringify(openingBook, null, 2))

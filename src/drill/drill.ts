import { initOpeningBook } from "../opening"

const openingBook = initOpeningBook()

// save opening book to opening-book.json

import fs from "fs"

fs.writeFileSync("opening-book.json", JSON.stringify(openingBook, null, 2))


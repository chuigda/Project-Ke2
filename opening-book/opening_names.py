import json, sys

opening_names = {}

for tsv_file in ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"]:
    print("importing file:", tsv_file, file=sys.stderr)
    with open(tsv_file) as tsv:
        lines = tsv.readlines()[1:]
        for (i, line) in enumerate(lines):
            eco, name, pgn = line.split("\t")
            opening_names[name] = ""

with open("names.json", "w") as f:
    json.dump(opening_names, f, indent=4)

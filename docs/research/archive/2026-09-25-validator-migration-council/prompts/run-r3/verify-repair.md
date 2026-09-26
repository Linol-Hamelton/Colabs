# Repair: task:vmc-verify, the same session, one targeted repair (PROTO-DEC-0075 item 4, INVALID_OUTPUT)

- Your previous turn said it would create `verification.md`, then ended without writing it. No file
  exists. Your reading is done; do not read the corpus again.
- Now, in this order:
  1. call your file-writing tool (`write_file`) once with the full `verification.md`, as
     `prompts/C-verify.md` and `prompts/run-r3/verify.md` define it;
  2. run `node .ai/bin/protocol-session.cjs start --agent mistral` if you have no journal yet, and
     write your journal entry with the five labels;
  3. run `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>`.
- Do not announce a step without doing it in the same turn. A reply that only describes the file
  is a failure.

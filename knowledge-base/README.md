# Let Me Lens knowledge base

Source documents for the Let Me Lens website chatbot (retrieval-augmented generation).
Language: English, matching the website's interface, so button names in the docs are identical to
the buttons people click. The chatbot can still answer in the visitor's language.

Read `_guide/WRITING-GUIDE.md` before adding or editing a file.

| Folder | Content | Ingested |
|---|---|---|
| `00-core/` | The always-in-prompt summary (put it in the system prompt) | System prompt |
| `site/` | What Let Me Lens is, the navigation map, the vocabulary of the interface | Yes |
| `features/visitor/` | Everything a visitor can do without an account | Yes |
| `features/account/` | Sign up, sign in, passwords, profile link, account deletion | Yes |
| `features/studio/` | Everything a photographer does in **My Studio** | Yes |
| `faq/` | Short answers and troubleshooting with exact error messages | Yes |
| `legal/` | Plain-language summary of the Privacy Notice | Yes |
| `tech/` | Public-level description of how the site is built | Yes |
| `about/` | Satea AlMallouhi, the creator | Only files with `status: published` |
| `_eval/` | Test questions with the file that should answer each one | No |
| `_guide/` | Writing rules | No |

# Plagx Draft Preflight for Airtable

*A free academic writing tool by Plagiarism Checker X.*

**Plagx Draft Preflight is a free, open-source Airtable extension that checks drafts stored in your base.** Pick the table and the long-text or rich-text field that holds your drafts, select a record, and check it for word count and reading time, in-text citations against the reference list, punctuation and basic grammar. Useful for content calendars, editorial pipelines, student submissions and research notes kept in Airtable.

- Read-only: the extension never changes your base
- Checks run in the extension, in your browser: nothing is stored or sent anywhere
- Long text, rich text (Markdown) and single-line text fields
- APA and MLA in-text citations
- Same rules as the [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) library

**[Try the live demo →](https://plagiarismcheckerx.github.io/plagx-preflight/)**

## Use

1. Add **Plagx Draft Preflight** to a base from the Airtable Marketplace (**Extensions → Add an extension**).
2. Pick the **Table** and the **Text field** with your drafts.
3. Select a record in the grid (or click **Choose record**), set word limits and citation style if you need them, and click **Check draft**.

Put the reference list under a heading or line such as References, Bibliography or Works Cited, one reference per line. In rich-text fields, headings, lists, quotes and bold/italic formatting are handled for you.

## Checks

| Group | Examples |
|---|---|
| Length & structure | Word, sentence and paragraph counts, reading time, word limits, long sentences and paragraphs |
| References | Citations with no entry in the reference list, references that are never cited |
| Punctuation | Unmatched quotes and brackets, double spaces, spacing around punctuation |
| Basic grammar | Repeated words, *a* / *an*, sentence capitals, common word confusions |

## Privacy

- **Permissions:** reads the chosen table, field and records; saves the chosen table and field in the extension's settings so collaborators see the same setup. It never writes records.
- **Data:** the text is checked in the extension and discarded. No accounts, tracking or network requests.

## Development

Built with the [Airtable Blocks SDK](https://airtable.com/developers/extensions).

```bash
npm install
npm test                                      # rich-text conversion tests
npm install -g @airtable/blocks-cli
block set-api-key                             # your personal access token (block:manage scope)
block add-remote appXXXXXXXX/blkXXXXXXXX default   # IDs from "Build a custom extension" in a base
block run                                     # develop in the base
block release                                 # release to the base
block submit                                  # submit to the Airtable Marketplace
npm run sync                                  # copy the latest core from ../plagx-preflight/src
```

| Path | What it does |
|---|---|
| `frontend/index.js` | The extension UI |
| `frontend/text.js` | Turns long-text and rich-text cells into paragraphs |
| `frontend/lib/` | The Plagx Preflight core, copied from [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) (MIT) |

## Plagx Preflight - Free Draft & Grammar Checker

An open-source writing utility for students, researchers and developers. Check length, structure, citations, punctuation and basic grammar before you submit.

Developed by Plagiarism Checker X.

Plagx Preflight gives writing suggestions; it does not detect plagiarism or AI-generated text. For full document checks, explore [Text Similarity Detector](https://plagiarismcheckerx.com/?utm_source=plagx-preflight-airtable-readme) and its [AI Content Detector](https://plagiarismcheckerx.com/ai-content-detector?utm_source=plagx-preflight-airtable-readme).

## License

MIT © Plagiarism Checker X

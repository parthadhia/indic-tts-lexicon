# indic-tts-lexicon

`indic-tts-lexicon` is a community-maintained pronunciation substitution lexicon for Indian-language words that appear inside English speech and TTS workflows.

The core use case is simple: if a model sees `Swaminarayan`, `Pramukh Swami Maharaj`, or `Satsang` in otherwise English text, it often applies English phonetics and says them incorrectly. This package lets you replace those terms with pronunciation-friendly text, IPA, or SSML phoneme markup before handing the result to a TTS engine.

## Why This Exists

English spelling is not enough for text-to-speech systems. Many Indian words are:

- transliterated in multiple ways
- pronounced differently than an English reader would guess
- part of devotional, cultural, and regional vocabularies that deserve respectful handling

This repo aims to be a clean open data layer plus a small TypeScript helper library. No web app, no database, no backend.

## License

This repository uses dual licensing to ensure it remains open-source forever and cannot be exploited for commercial gain:

- **Code** (in `src/`, `web/`, `tests/`, `examples/`, `scripts/`) is licensed under **GPLv3**.
- **Pronunciation Data** (in `data/*.json`) is licensed under **CC BY-NC-SA 4.0** (Non-Commercial).

This strictly prohibits using the community-contributed pronunciation data for commercial products or making money. See [LICENSE](./LICENSE) for full details.

## Install

```bash
npm install indic-tts-lexicon
```

## Quick Usage

```ts
import { replaceTerms, replaceTermsToSSML } from "indic-tts-lexicon";

const spokenText = replaceTerms(
  "Jay Swaminarayan. Mahant Swami Maharaj visited the mandir.",
  { language: "gujarati" },
);

const ssmlText = replaceTermsToSSML(
  "Pramukh Swami Maharaj inspired seva and satsang.",
  { language: "gujarati" },
);
```

Example output:

```txt
jai swaa-mee-naa-raa-yan. muh-hunt swaa-mee maa-haa-raaj visited the mun-deer.
```

Example SSML output:

```xml
<phoneme alphabet="ipa" ph="pɾə.mukʰ sʋɑː.mi mə.ɦɑː.ɾɑːdʒ">Pramukh Swami Maharaj</phoneme> inspired <phoneme alphabet="ipa" ph="seː.ʋɑː">seva</phoneme> and <phoneme alphabet="ipa" ph="sət.səŋg">satsang</phoneme>.
```

## API

### `loadLexicon(language)`

Loads the entries for a language.

```ts
const entries = loadLexicon("gujarati");
```

### `replaceTerms(text, options)`

Replaces matching terms using one of these modes:

- `pronunciation_text`
- `ipa`
- `ssml`

Default behavior:

- matches longest terms first
- matches aliases
- preserves punctuation
- uses case-insensitive matching unless disabled
- leaves unknown words unchanged

### `replaceTermsToSSML(text, options)`

Convenience wrapper around `replaceTerms(..., { mode: "ssml" })`.

## Data Format

Each entry follows [`schemas/entry.schema.json`](./schemas/entry.schema.json) and supports:

- `id`
- `word`
- `language`
- `native_script`
- `pronunciation_text`
- `ipa`
- `ssml_phoneme`
- `aliases`
- `category`
- `notes`
- `contributors`
- `reviewed`

Example entry:

```json
{
  "id": "gujarati-swaminarayan",
  "word": "Swaminarayan",
  "language": "gujarati",
  "native_script": "સ્વામિનારાયણ",
  "pronunciation_text": "swa-mee-na-ra-yan",
  "ipa": "sʋɑː.mi.nɑː.ɾɑː.jəɳ",
  "ssml_phoneme": {
    "alphabet": "ipa",
    "ph": "sʋɑː.mi.nɑː.ɾɑː.jəɳ"
  },
  "aliases": [],
  "category": "devotional",
  "notes": "Seed approximation. Community review still needed.",
  "contributors": ["initial-seed"],
  "reviewed": false
}
```

## Review Policy

Pronunciation is not uniform across regions, sampradayas, families, or speaker communities.

Rules for this repo:

- `reviewed: true` should be used only when an entry has been checked by a qualified reviewer or trusted community process.
- Seed data should default to `reviewed: false` unless confidence is high.
- Regional or community variation belongs in `notes`.
- Respectful spellings matter, especially for devotional terms.

This repo does not claim authoritative pronunciation for every tradition or region.

## Contribution Guide

1. Add or edit entries in the appropriate `data/*.json` file.
2. Follow [`schemas/entry.schema.json`](./schemas/entry.schema.json).
3. Keep contributor notes when they carry useful context.
4. Run:

```bash
npm run validate:data
npm test
```

More detail lives in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Examples

### Plain-text replacement

```ts
replaceTerms("Jay Swaminarayan and welcome to the mandir.", {
  language: "gujarati",
  mode: "pronunciation_text",
});
```

### IPA replacement

```ts
replaceTerms("Swami offered seva.", {
  language: "sanskrit",
  mode: "ipa",
});
```

### SSML replacement

```ts
replaceTermsToSSML("Pramukh Swami Maharaj inspired satsang.", {
  language: "gujarati",
});
```

## Community Files

- new pronunciation issue template
- pull request template
- CI workflow for tests and schema validation

## Status

This is an MVP starter repo. The pronunciation entries are practical approximations meant to improve English TTS behavior, not final linguistic authorities. Many community-seeded entries remain unreviewed by design.

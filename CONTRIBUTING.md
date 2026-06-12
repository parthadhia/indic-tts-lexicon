# Contributing

## Scope

This project collects pronunciation substitution entries for Indian-language words used inside English TTS and speech workflows.

Contributions can include:

- new words or phrases
- improved pronunciation approximations
- IPA fixes
- SSML phoneme fixes
- regional variation notes
- tests for replacement behavior

## Ground Rules

- Do not mark an entry `reviewed: true` unless you are confident it has been checked through a reliable review process.
- Keep regional or community variation in `notes`.
- Use respectful spelling for devotional and community-specific terms.
- Do not overwrite contributor notes unless they are clearly incorrect or misleading.
- Prefer small, traceable pull requests.

## Entry Checklist

When adding or editing an entry:

1. Follow [`schemas/entry.schema.json`](./schemas/entry.schema.json).
2. Fill every supported field. Use `null` where a field is not yet known.
3. Add aliases when the same term is commonly transliterated multiple ways.
4. Keep `pronunciation_text` practical for English TTS, not purely academic.
5. Add `ipa` and `ssml_phoneme` when possible.
6. Default `reviewed` to `false` unless certainty is justified.

## Development

```bash
npm install
npm run build
npm run validate:data
npm test
```

## Review Policy

Entries may reflect variation across:

- region
- dialect
- family/community usage
- devotional tradition

That variation is expected. Use `notes` instead of pretending one pronunciation is universal.

## Pull Requests

- explain what changed
- cite pronunciation reasoning when available
- mention whether the entry is still approximate
- include tests if replacement behavior changes

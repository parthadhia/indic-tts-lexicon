# Repository AGENTS.md

## Purpose

Build and maintain a clean open-source lexicon for Indian-language pronunciation substitutions in English TTS workflows.

## Delivery Rules

- Keep the package simple and maintainable.
- No backend, database, or web app in this repo.
- Prefer small TypeScript utilities over abstraction-heavy architecture.

## Before Finishing Any Task

- run tests
- validate JSON files against the schema
- update README if behavior changes

## Pronunciation Data Rules

- do not claim entries are authoritative unless `reviewed=true`
- keep regional variation notes when relevant
- preserve respectful spelling for devotional terms
- avoid overwriting contributor notes unless clearly wrong

import gujarati from "../data/gujarati.json" with { type: "json" };
import hindi from "../data/hindi.json" with { type: "json" };
import sanskrit from "../data/sanskrit.json" with { type: "json" };

export type LexiconLanguage = "gujarati" | "hindi" | "sanskrit";
export type ReplacementMode = "pronunciation_text" | "ipa" | "ssml";

export interface SsmlPhoneme {
  alphabet: string;
  ph: string;
}

export interface LexiconEntry {
  id: string;
  word: string;
  language: LexiconLanguage;
  native_script: string | null;
  pronunciation_text: string | null;
  ipa: string | null;
  ssml_phoneme: SsmlPhoneme | null;
  aliases: string[];
  category: string | null;
  notes: string | null;
  contributors: string[];
  reviewed: boolean;
}

export interface ReplaceOptions {
  language: string;
  mode?: ReplacementMode;
  caseInsensitive?: boolean;
  preserveOriginalInParentheses?: boolean;
}

interface Candidate {
  entry: LexiconEntry;
  term: string;
  comparable: string;
}

interface MatchResult {
  entry: LexiconEntry;
  matchedText: string;
  nextIndex: number;
}

const LANGUAGE_ALIASES: Record<string, LexiconLanguage> = {
  gu: "gujarati",
  gujarati: "gujarati",
  hi: "hindi",
  hindi: "hindi",
  sa: "sanskrit",
  sanskrit: "sanskrit"
};

const LEXICONS: Record<LexiconLanguage, LexiconEntry[]> = {
  gujarati: gujarati as LexiconEntry[],
  hindi: hindi as LexiconEntry[],
  sanskrit: sanskrit as LexiconEntry[]
};

const WORD_CHAR_PATTERN = /[\p{L}\p{N}\p{M}]/u;

export function loadLexicon(language: string): LexiconEntry[] {
  const resolvedLanguage = resolveLanguage(language);

  return LEXICONS[resolvedLanguage].map((entry) => ({
    ...entry,
    aliases: [...entry.aliases],
    contributors: [...entry.contributors],
    ssml_phoneme: entry.ssml_phoneme ? { ...entry.ssml_phoneme } : null
  }));
}

export function replaceTerms(text: string, options: ReplaceOptions): string {
  const mode = options.mode ?? "pronunciation_text";
  const caseInsensitive = options.caseInsensitive ?? true;
  const preserveOriginalInParentheses =
    options.preserveOriginalInParentheses ?? false;

  const entries = loadLexicon(options.language);
  const candidates = buildCandidates(entries, caseInsensitive);

  let output = "";
  let index = 0;

  while (index < text.length) {
    const match = findMatch(text, index, candidates, caseInsensitive);

    if (!match) {
      output += text[index];
      index += 1;
      continue;
    }

    output += renderReplacement(
      match.entry,
      match.matchedText,
      mode,
      preserveOriginalInParentheses
    );
    index = match.nextIndex;
  }

  return output;
}

export function replaceTermsToSSML(
  text: string,
  options: Omit<ReplaceOptions, "mode">
): string {
  return replaceTerms(text, {
    ...options,
    mode: "ssml"
  });
}

function resolveLanguage(language: string): LexiconLanguage {
  const normalized = language.trim().toLowerCase();
  const resolved = LANGUAGE_ALIASES[normalized];

  if (!resolved) {
    throw new Error(
      `Unsupported language "${language}". Expected one of: ${Object.keys(LANGUAGE_ALIASES)
        .filter((value, index, list) => list.indexOf(value) === index)
        .join(", ")}`
    );
  }

  return resolved;
}

function buildCandidates(
  entries: LexiconEntry[],
  caseInsensitive: boolean
): Candidate[] {
  return entries
    .flatMap((entry) =>
      [entry.word, ...entry.aliases].map((term) => ({
        entry,
        term,
        comparable: caseInsensitive ? term.toLocaleLowerCase() : term
      }))
    )
    .sort((left, right) => right.term.length - left.term.length);
}

function findMatch(
  text: string,
  startIndex: number,
  candidates: Candidate[],
  caseInsensitive: boolean
): MatchResult | null {
  for (const candidate of candidates) {
    const slice = text.slice(startIndex, startIndex + candidate.term.length);
    const comparable = caseInsensitive ? slice.toLocaleLowerCase() : slice;

    if (comparable !== candidate.comparable) {
      continue;
    }

    if (!hasBoundary(text, startIndex, candidate.term.length)) {
      continue;
    }

    return {
      entry: candidate.entry,
      matchedText: slice,
      nextIndex: startIndex + candidate.term.length
    };
  }

  return null;
}

function hasBoundary(text: string, startIndex: number, length: number): boolean {
  const previousChar = startIndex > 0 ? text[startIndex - 1] : "";
  const nextChar =
    startIndex + length < text.length ? text[startIndex + length] : "";

  const hasLeftBoundary = previousChar === "" || !WORD_CHAR_PATTERN.test(previousChar);
  const hasRightBoundary = nextChar === "" || !WORD_CHAR_PATTERN.test(nextChar);

  return hasLeftBoundary && hasRightBoundary;
}

function renderReplacement(
  entry: LexiconEntry,
  matchedText: string,
  mode: ReplacementMode,
  preserveOriginalInParentheses: boolean
): string {
  const baseReplacement = selectReplacement(entry, matchedText, mode);

  if (!preserveOriginalInParentheses) {
    return baseReplacement;
  }

  return `${baseReplacement} (${matchedText})`;
}

function selectReplacement(
  entry: LexiconEntry,
  matchedText: string,
  mode: ReplacementMode
): string {
  if (mode === "ssml") {
    const phoneme = entry.ssml_phoneme ?? deriveSsmlFromIpa(entry);

    if (!phoneme) {
      return matchedText;
    }

    return `<phoneme alphabet="${escapeAttribute(phoneme.alphabet)}" ph="${escapeAttribute(phoneme.ph)}">${escapeText(
      matchedText
    )}</phoneme>`;
  }

  if (mode === "ipa") {
    return entry.ipa ?? entry.pronunciation_text ?? matchedText;
  }

  return entry.pronunciation_text ?? entry.ipa ?? matchedText;
}

function deriveSsmlFromIpa(entry: LexiconEntry): SsmlPhoneme | null {
  if (!entry.ipa) {
    return null;
  }

  return {
    alphabet: "ipa",
    ph: entry.ipa
  };
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

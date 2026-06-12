export interface SsmlPhoneme {
  alphabet: string;
  ph: string;
}

export interface LexiconEntry {
  id: string;
  word: string;
  language: string;
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

import type { LexiconEntry } from '../types/lexicon';
import gujaratiData from './gujarati.json';
import hindiData from './hindi.json';
import sanskritData from './sanskrit.json';

export const LANGUAGES = {
  all: 'All Languages',
  gujarati: 'Gujarati',
  hindi: 'Hindi',
  sanskrit: 'Sanskrit'
};

export const ALL_DATA: Record<string, LexiconEntry[]> = {
  gujarati: gujaratiData as LexiconEntry[],
  hindi: hindiData as LexiconEntry[],
  sanskrit: sanskritData as LexiconEntry[]
};

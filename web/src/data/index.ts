import type { LexiconEntry } from '../types/lexicon';
import gujaratiData from './gujarati.json';
import hindiData from './hindi.json';
import sanskritData from './sanskrit.json';
import marathiData from './marathi.json';
import bengaliData from './bengali.json';
import tamilData from './tamil.json';
import teluguData from './telugu.json';
import kannadaData from './kannada.json';
import malayalamData from './malayalam.json';
import punjabiData from './punjabi.json';
import odiaData from './odia.json';
import assameseData from './assamese.json';

export const LANGUAGES = {
  all: 'All Languages',
  gujarati: 'Gujarati',
  hindi: 'Hindi',
  sanskrit: 'Sanskrit',
  marathi: 'Marathi',
  bengali: 'Bengali',
  tamil: 'Tamil',
  telugu: 'Telugu',
  kannada: 'Kannada',
  malayalam: 'Malayalam',
  punjabi: 'Punjabi',
  odia: 'Odia',
  assamese: 'Assamese'
};

export const ALL_DATA: Record<string, LexiconEntry[]> = {
  gujarati: gujaratiData as LexiconEntry[],
  hindi: hindiData as LexiconEntry[],
  sanskrit: sanskritData as LexiconEntry[],
  marathi: marathiData as LexiconEntry[],
  bengali: bengaliData as LexiconEntry[],
  tamil: tamilData as LexiconEntry[],
  telugu: teluguData as LexiconEntry[],
  kannada: kannadaData as LexiconEntry[],
  malayalam: malayalamData as LexiconEntry[],
  punjabi: punjabiData as LexiconEntry[],
  odia: odiaData as LexiconEntry[],
  assamese: assameseData as LexiconEntry[]
};

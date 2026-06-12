import {
  loadLexicon,
  replaceTerms,
  replaceTermsToSSML
} from "../src/index.js";

const entries = loadLexicon("gujarati");
console.log(`Loaded ${entries.length} Gujarati entries.`);

const plainText = replaceTerms(
  "Jay Swaminarayan. Mahant Swami Maharaj visited the mandir for seva.",
  { language: "gujarati" }
);

const ssml = replaceTermsToSSML(
  "Pramukh Swami Maharaj inspired satsang and seva.",
  { language: "gujarati" }
);

console.log(plainText);
console.log(ssml);

import { describe, expect, it } from "vitest";

import {
  loadLexicon,
  replaceTerms,
  replaceTermsToSSML
} from "../src/index.js";

describe("loadLexicon", () => {
  it("loads a language lexicon", () => {
    const entries = loadLexicon("gujarati");

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((entry) => entry.word === "Swaminarayan")).toBe(true);
  });
});

describe("replaceTerms", () => {
  it("does simple replacement", () => {
    const result = replaceTerms("Swaminarayan", {
      language: "gujarati"
    });

    expect(result).toBe("swaa-mee-naa-raa-yan");
  });

  it("uses the longest matching phrase first", () => {
    const result = replaceTerms("Pramukh Swami Maharaj led the event.", {
      language: "gujarati"
    });

    expect(result).toBe("pruh-mookh swaa-mee maa-haa-raaj led the event.");
  });

  it("supports aliases", () => {
    const result = replaceTerms("Jai Swaminarayan to everyone.", {
      language: "gujarati"
    });

    expect(result).toBe("jai swaa-mee-naa-raa-yan to everyone.");
  });

  it("preserves punctuation", () => {
    const result = replaceTerms("Mandir, seva, and satsang.", {
      language: "gujarati"
    });

    expect(result).toBe("mun-deer, say-vaa, and sut-sung.");
  });

  it("leaves unknown words unchanged", () => {
    const result = replaceTerms("Welcome everyone.", {
      language: "gujarati"
    });

    expect(result).toBe("Welcome everyone.");
  });

  it("can preserve the original text in parentheses", () => {
    const result = replaceTerms("Swami", {
      language: "gujarati",
      preserveOriginalInParentheses: true
    });

    expect(result).toBe("swaa-mee (Swami)");
  });
});

describe("replaceTermsToSSML", () => {
  it("returns SSML phoneme markup", () => {
    const result = replaceTermsToSSML("Swaminarayan", {
      language: "gujarati"
    });

    expect(result).toContain("<phoneme");
    expect(result).toContain("alphabet=\"ipa\"");
    expect(result).toContain(">Swaminarayan</phoneme>");
  });
});

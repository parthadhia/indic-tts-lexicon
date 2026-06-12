

export function Footer() {
  return (
    <footer className="site-footer container">
      <p>© {new Date().getFullYear()} Indic Pronunciation Lexicon Project. MIT Code. CC-BY-4.0 Pronunciation Data.</p>
      <div className="footer-links">
        <a href="https://github.com/parthadhia/indic-tts-lexicon" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
        <a href="https://github.com/parthadhia/indic-tts-lexicon/blob/main/LICENSE" target="_blank" rel="noreferrer" className="footer-link">License</a>
        <a href="https://github.com/parthadhia/indic-tts-lexicon/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" className="footer-link">Contributing Guide</a>
      </div>
    </footer>
  );
}

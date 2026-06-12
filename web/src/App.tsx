import { useState, useMemo, useEffect } from 'react';
import gujaratiData from './data/gujarati.json';
import hindiData from './data/hindi.json';
import sanskritData from './data/sanskrit.json';

interface SsmlPhoneme {
  alphabet: string;
  ph: string;
}

interface LexiconEntry {
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

const LANGUAGES = {
  all: 'All Languages',
  gujarati: 'Gujarati',
  hindi: 'Hindi',
  sanskrit: 'Sanskrit'
};

const ALL_DATA: Record<string, LexiconEntry[]> = {
  gujarati: gujaratiData as LexiconEntry[],
  hindi: hindiData as LexiconEntry[],
  sanskrit: sanskritData as LexiconEntry[]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'playground' | 'contribute'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [limit, setLimit] = useState(60);

  // Playground States
  const [sandboxText, setSandboxText] = useState('Jay Swaminarayan. Mahant Swami Maharaj visited the mandir.');
  const [sandboxLang, setSandboxLang] = useState('gujarati');
  const [sandboxMode, setSandboxMode] = useState<'pronunciation_text' | 'ssml' | 'ipa'>('pronunciation_text');

  // Contribution States
  const [contributeWord, setContributeWord] = useState('');
  const [contributeLang, setContributeLang] = useState('gujarati');
  const [contributeScript, setContributeScript] = useState('');
  const [contributePron, setContributePron] = useState('');
  const [contributeIpa, setContributeIpa] = useState('');
  const [contributeCat, setContributeCat] = useState('devotional');
  const [contributeNotes, setContributeNotes] = useState('');
  const [contributeName, setContributeName] = useState('');

  // Speech helper state
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Combine data
  const combinedEntries = useMemo(() => {
    const list: LexiconEntry[] = [];
    if (selectedLanguage === 'all') {
      Object.values(ALL_DATA).forEach(data => list.push(...data));
    } else {
      const data = ALL_DATA[selectedLanguage];
      if (data) list.push(...data);
    }
    return list;
  }, [selectedLanguage]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    combinedEntries.forEach(entry => {
      if (entry.category) cats.add(entry.category);
    });
    return Array.from(cats).sort();
  }, [combinedEntries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let list = combinedEntries;

    if (selectedCategory !== 'all') {
      list = list.filter(entry => entry.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(entry => 
        entry.word.toLowerCase().includes(q) ||
        (entry.native_script && entry.native_script.includes(q)) ||
        (entry.pronunciation_text && entry.pronunciation_text.toLowerCase().includes(q)) ||
        (entry.category && entry.category.toLowerCase().includes(q)) ||
        entry.aliases.some(alias => alias.toLowerCase().includes(q))
      );
    }

    return list;
  }, [combinedEntries, selectedCategory, searchQuery]);

  // Slice list for pagination
  const visibleEntries = useMemo(() => {
    return filteredEntries.slice(0, limit);
  }, [filteredEntries, limit]);

  // Reset pagination on query or category change
  useEffect(() => {
    setLimit(60);
  }, [searchQuery, selectedLanguage, selectedCategory]);

  // TTS playback
  const playSpeech = (text: string, isOriginal = false) => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Simulate English TTS reading Indian terms
    const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Slow down original slightly to highlight how wrong it sounds
    utterance.rate = isOriginal ? 0.85 : 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Live replacement algorithm
  const renderReplacementText = useMemo(() => {
    const lexicon = ALL_DATA[sandboxLang] || [];
    if (!lexicon.length || !sandboxText.trim()) return sandboxText;

    // Build replacement candidates
    const WORD_CHAR_PATTERN = /[\p{L}\p{N}\p{M}]/u;
    const candidates = lexicon
      .flatMap((entry) =>
        [entry.word, ...entry.aliases].map((term) => ({
          entry,
          term,
          comparable: term.toLocaleLowerCase()
        }))
      )
      .sort((a, b) => b.term.length - a.term.length);

    let output = '';
    let index = 0;

    const hasBoundary = (text: string, startIndex: number, length: number) => {
      const prev = startIndex > 0 ? text[startIndex - 1] : '';
      const next = startIndex + length < text.length ? text[startIndex + length] : '';
      const leftBound = prev === '' || !WORD_CHAR_PATTERN.test(prev);
      const rightBound = next === '' || !WORD_CHAR_PATTERN.test(next);
      return leftBound && rightBound;
    };

    const escapeAttr = (val: string) => val.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapeTxt = (val: string) => val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    while (index < sandboxText.length) {
      let matched = false;

      for (const candidate of candidates) {
        const slice = sandboxText.slice(index, index + candidate.term.length);
        if (slice.toLocaleLowerCase() === candidate.comparable && hasBoundary(sandboxText, index, candidate.term.length)) {
          // Render replacement based on mode
          const { entry } = candidate;
          if (sandboxMode === 'ssml') {
            const ph = entry.ssml_phoneme?.ph || entry.ipa;
            const alphabet = entry.ssml_phoneme?.alphabet || 'ipa';
            if (ph) {
              output += `<phoneme alphabet="${escapeAttr(alphabet)}" ph="${escapeAttr(ph)}">${escapeTxt(slice)}</phoneme>`;
            } else {
              output += slice;
            }
          } else if (sandboxMode === 'ipa') {
            output += entry.ipa || entry.pronunciation_text || slice;
          } else {
            output += entry.pronunciation_text || entry.ipa || slice;
          }
          index += candidate.term.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        output += sandboxText[index];
        index += 1;
      }
    }

    return output;
  }, [sandboxText, sandboxLang, sandboxMode]);

  // Generated JSON for contribution
  const generatedJson = useMemo(() => {
    const id = `${contributeLang}-${contributeWord.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}`;
    const entry = {
      id,
      word: contributeWord.trim(),
      language: contributeLang,
      native_script: contributeScript.trim() || null,
      pronunciation_text: contributePron.trim() || null,
      ipa: contributeIpa.trim() || null,
      ssml_phoneme: contributeIpa.trim() ? { alphabet: 'ipa', ph: contributeIpa.trim() } : null,
      aliases: [],
      category: contributeCat,
      notes: contributeNotes.trim() || 'Imported from community contribution.',
      contributors: contributeName.trim() ? [contributeName.trim()] : ['community-contributor'],
      reviewed: false
    };
    return JSON.stringify(entry, null, 2);
  }, [contributeWord, contributeLang, contributeScript, contributePron, contributeIpa, contributeCat, contributeNotes, contributeName]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div>
      {/* Site Header */}
      <header className="site-header">
        <div className="container header-container">
          <a href="#" className="logo-link">
            <div className="logo-icon">अ</div>
            <div className="logo-text">
              <h1>Indic Pronunciation Lexicon</h1>
              <span>Community Data Layer</span>
            </div>
          </a>
          
          <nav className="nav-links">
            <button 
              className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search Lexicon
            </button>
            <button 
              className={`nav-btn ${activeTab === 'playground' ? 'active' : ''}`}
              onClick={() => setActiveTab('playground')}
            >
              Live Playground
            </button>
            <button 
              className={`nav-btn ${activeTab === 'contribute' ? 'active' : ''}`}
              onClick={() => setActiveTab('contribute')}
            >
              Submit Pronunciation
            </button>
            <a 
              href="https://github.com/parthadhia/indic-tts-lexicon" 
              target="_blank" 
              rel="noreferrer" 
              className="nav-github"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Header */}
      <section className="hero container">
        <h2>Refining Indian Accents in English Speech</h2>
        <p>
          An open-source pronunciation dictionary mapping regional terms to phonetic representations, ensuring respect and correctness in Text-to-Speech (TTS) and Speech-to-Text (SST) systems.
        </p>
      </section>

      {/* Main Content Area */}
      <main className="container">
        {activeTab === 'search' && (
          <div>
            {/* Search & Controls Card */}
            <div className="search-controls-wrapper">
              <div className="search-bar-container">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search by English spelling, Native script, pronunciation (e.g. Swaminarayan, satsang, akshar)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filters-row">
                <div className="filter-group">
                  <span className="filter-label">Language:</span>
                  <div className="pill-container">
                    {Object.entries(LANGUAGES).map(([key, label]) => (
                      <button
                        key={key}
                        className={`pill ${selectedLanguage === key ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedLanguage(key);
                          setSelectedCategory('all');
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Category:</span>
                  <select 
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '0.45rem 1rem', borderRadius: '20px' }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="stats-label">
                  Showing <strong>{filteredEntries.length}</strong> of <strong>{combinedEntries.length}</strong> entries
                </div>
              </div>
            </div>

            {/* Grid of Results */}
            {visibleEntries.length > 0 ? (
              <div>
                <div className="cards-grid">
                  {visibleEntries.map(entry => (
                    <div className="word-card" key={entry.id}>
                      <div>
                        <div className="card-header">
                          <h3 className="word-title">{entry.word}</h3>
                          <span className={`lang-badge ${entry.language}`}>
                            {entry.language}
                          </span>
                        </div>
                        {entry.native_script && (
                          <div className="native-script">{entry.native_script}</div>
                        )}

                        <div className="pronunciation-box">
                          <div>
                            <span className="pronunciation-label">Pronunciation</span>
                            <div className="pronunciation-value">{entry.pronunciation_text || '—'}</div>
                          </div>
                          {speechSupported && entry.pronunciation_text && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                className="speak-btn" 
                                title="Play raw English (mispronounced)"
                                onClick={() => playSpeech(entry.word, true)}
                              >
                                🔇
                              </button>
                              <button 
                                className="speak-btn" 
                                title="Play correct pronunciation"
                                onClick={() => playSpeech(entry.pronunciation_text || '')}
                              >
                                🔊
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="card-details">
                          <div className="detail-item">
                            <span className="detail-name">Category</span>
                            <span className="detail-value">{entry.category || '—'}</span>
                          </div>
                          {entry.ipa && (
                            <div className="detail-item">
                              <span className="detail-name">IPA</span>
                              <span className="detail-value" style={{ fontFamily: 'monospace' }}>{entry.ipa}</span>
                            </div>
                          )}
                          <div className="detail-item">
                            <span className="detail-name">Contributors</span>
                            <span className="detail-value">{entry.contributors.join(', ')}</span>
                          </div>
                        </div>

                        {entry.notes && (
                          <p className="notes-text">
                            <strong>Note:</strong> {entry.notes}
                          </p>
                        )}
                      </div>

                      <div className={`reviewed-badge ${entry.reviewed ? 'yes' : 'no'}`}>
                        {entry.reviewed ? '✓ Verified Entry' : '⚠ Unverified Seed'}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredEntries.length > limit && (
                  <div style={{ textAlign: 'center', margin: '2rem 0 4rem' }}>
                    <button 
                      className="btn-primary"
                      onClick={() => setLimit(prev => prev + 60)}
                    >
                      Load More Words
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No entries found</h3>
                <p>Try searching for another word or check your filters.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playground' && (
          <div className="playground-section">
            <div className="playground-column">
              <h3 className="section-title-gradient">Live Pronunciation Sandbox</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Type an English sentence containing Indian names or devotional terms. The sandbox will substitute them on the fly according to the active lexicon.
              </p>

              <div className="form-field" style={{ marginTop: '1rem' }}>
                <label className="form-label">Input Text</label>
                <textarea 
                  className="playground-text-area"
                  value={sandboxText}
                  onChange={(e) => setSandboxText(e.target.value)}
                  placeholder="Enter your sentence here..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label className="form-label">Lexicon Language</label>
                  <select 
                    className="form-select"
                    value={sandboxLang}
                    onChange={(e) => setSandboxLang(e.target.value)}
                  >
                    <option value="gujarati">Gujarati</option>
                    <option value="hindi">Hindi</option>
                    <option value="sanskrit">Sanskrit</option>
                  </select>
                </div>

                <div className="form-field" style={{ flex: 1 }}>
                  <label className="form-label">Replacement Mode</label>
                  <select 
                    className="form-select"
                    value={sandboxMode}
                    onChange={(e) => setSandboxMode(e.target.value as any)}
                  >
                    <option value="pronunciation_text">Pronunciation Guide</option>
                    <option value="ipa">IPA Symbols</option>
                    <option value="ssml">SSML XML Phoneme</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="playground-column">
              <h3 className="section-title-gradient">Substituted Output</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                This output can be directly handed over to standard text-to-speech engines like Google Cloud TTS, Amazon Polly, or OpenAI.
              </p>

              <div className="form-field" style={{ marginTop: '1rem', position: 'relative' }}>
                <label className="form-label">Output</label>
                <div className="playground-output-container">
                  <button 
                    className="copy-overlay-btn"
                    onClick={() => copyToClipboard(renderReplacementText)}
                  >
                    Copy Output
                  </button>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {renderReplacementText}
                  </pre>
                </div>
              </div>

              {speechSupported && sandboxMode === 'pronunciation_text' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    className="btn-primary" 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', flex: 1 }}
                    onClick={() => playSpeech(sandboxText, true)}
                  >
                    Play Unsubstituted
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => playSpeech(renderReplacementText)}
                  >
                    Play Substituted
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contribute' && (
          <div className="contribution-card">
            <h3 className="section-title-gradient">Create Pronunciation Entry</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Fill in this helper form to generate the exact JSON format needed to contribute a pronunciation to the repository.
            </p>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Word / Phrase (English spelling)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Swaminarayan" 
                  value={contributeWord}
                  onChange={(e) => setContributeWord(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Language</label>
                <select 
                  className="form-select"
                  value={contributeLang}
                  onChange={(e) => setContributeLang(e.target.value)}
                >
                  <option value="gujarati">Gujarati</option>
                  <option value="hindi">Hindi</option>
                  <option value="sanskrit">Sanskrit</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Native Script (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. સ્વામિનારાયણ" 
                  value={contributeScript}
                  onChange={(e) => setContributeScript(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Pronunciation Guide (Dash approximations)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. swa-mee-na-ra-yan" 
                  value={contributePron}
                  onChange={(e) => setContributePron(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">IPA Symbols (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. sʋɑː.mi.nɑː.ɾɑː.jəɳ" 
                  value={contributeIpa}
                  onChange={(e) => setContributeIpa(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={contributeCat}
                  onChange={(e) => setContributeCat(e.target.value)}
                >
                  <option value="devotional">Devotional</option>
                  <option value="community seed">Community Seed</option>
                  <option value="place">Place / Location</option>
                  <option value="name">Personal Name</option>
                  <option value="general">General Vocabulary</option>
                </select>
              </div>

              <div className="form-field form-field-full">
                <label className="form-label">Notes & Regional Variations</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="e.g. Seed approximation. Community review still needed." 
                  value={contributeNotes}
                  onChange={(e) => setContributeNotes(e.target.value)}
                />
              </div>

              <div className="form-field form-field-full">
                <label className="form-label">Your Name / GitHub Username (for attribution)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. parthadhia" 
                  value={contributeName}
                  onChange={(e) => setContributeName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="form-label" style={{ color: 'var(--primary)' }}>Generated Entry JSON</h4>
                <button 
                  className="btn-primary" 
                  onClick={() => copyToClipboard(generatedJson)}
                  disabled={!contributeWord}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', opacity: contributeWord ? 1 : 0.5 }}
                >
                  Copy JSON Entry
                </button>
              </div>

              <div className="json-output-wrapper">
                {contributeWord ? generatedJson : '// Form object will show up here as soon as you enter a Word.'}
              </div>

              {contributeWord && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>Next Steps:</strong> To add this pronunciation, copy the JSON block above, open a Pull Request on our GitHub repository, and insert it into the bottom of the data file: <code>data/{contributeLang}.json</code>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer container">
        <p>© 2026 Indic Pronunciation Lexicon Project. MIT Code. CC-BY-4.0 Pronunciation Data.</p>
        <div className="footer-links">
          <a href="https://github.com/parthadhia/indic-tts-lexicon" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
          <a href="https://github.com/parthadhia/indic-tts-lexicon/blob/main/LICENSE" target="_blank" rel="noreferrer" className="footer-link">License</a>
          <a href="https://github.com/parthadhia/indic-tts-lexicon/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" className="footer-link">Contributing Guide</a>
        </div>
      </footer>
    </div>
  );
}

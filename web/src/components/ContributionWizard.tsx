import { useState, useMemo } from 'react';

const LANGUAGES = ['gujarati', 'hindi', 'sanskrit', 'marathi', 'bengali', 'tamil', 'telugu', 'kannada', 'malayalam', 'punjabi', 'odia', 'assamese'];

export function ContributionWizard() {
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // Single mode states
  const [contributeWord, setContributeWord] = useState('');
  const [contributeLang, setContributeLang] = useState('gujarati');
  const [contributeScript, setContributeScript] = useState('');
  const [contributePron, setContributePron] = useState('');
  const [contributeIpa, setContributeIpa] = useState('');
  const [contributeCat, setContributeCat] = useState('devotional');
  const [contributeNotes, setContributeNotes] = useState('');
  const [contributeName, setContributeName] = useState('');

  // Batch mode state
  const [batchText, setBatchText] = useState('');

  const generatedJson = useMemo(() => {
    if (mode === 'single') {
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
    } else {
      if (!batchText.trim()) return '';
      const lines = batchText.split('\n').filter(l => l.trim());
      const entries = lines.map(line => {
        const parts = line.split('\t').map(p => p.trim());
        const word = parts[0] || '';
        const lang = parts[1]?.toLowerCase() || 'gujarati';
        const script = parts[2] || '';
        const pron = parts[3] || '';
        const ipa = parts[4] || '';
        const cat = parts[5] || 'general';
        const id = `${lang}-${word.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        return {
          id,
          word,
          language: LANGUAGES.includes(lang) ? lang : 'gujarati',
          native_script: script || null,
          pronunciation_text: pron || null,
          ipa: ipa || null,
          ssml_phoneme: ipa ? { alphabet: 'ipa', ph: ipa } : null,
          aliases: [],
          category: cat,
          notes: 'Batch imported from community contribution.',
          contributors: contributeName.trim() ? [contributeName.trim()] : ['community-contributor'],
          reviewed: false
        };
      });
      return JSON.stringify(entries, null, 2);
    }
  }, [mode, batchText, contributeWord, contributeLang, contributeScript, contributePron, contributeIpa, contributeCat, contributeNotes, contributeName]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const createGitHubIssue = () => {
    const title = mode === 'single' ? `New Pronunciation: ${contributeWord} (${contributeLang})` : `Batch Pronunciation Import`;
    const body = `### New Lexicon Entry\n\n\`\`\`json\n${generatedJson}\n\`\`\`\n\nPlease review and add to the appropriate data file.`;
    const url = `https://github.com/parthadhia/indic-tts-lexicon/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const hasData = mode === 'single' ? !!contributeWord.trim() : !!batchText.trim();

  return (
    <div className="contribution-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="section-title-gradient">Create Pronunciation Entry</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Fill in this helper form to generate the exact JSON format needed to contribute a pronunciation to the repository.
          </p>
        </div>
        
        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.25rem' }}>
          <button 
            className={`nav-btn ${mode === 'single' ? 'active' : ''}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setMode('single')}
          >
            Single Entry
          </button>
          <button 
            className={`nav-btn ${mode === 'batch' ? 'active' : ''}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setMode('batch')}
          >
            Batch Submission
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Word / Phrase (English spelling) <span style={{color: 'red'}}>*</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Swaminarayan" 
              value={contributeWord}
              onChange={(e) => setContributeWord(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Language <span style={{color: 'red'}}>*</span></label>
            <select 
              className="form-select"
              value={contributeLang}
              onChange={(e) => setContributeLang(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
              ))}
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
            <label className="form-label">Pronunciation Guide (Dash approximations) <span style={{color: 'red'}}>*</span></label>
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
            <label className="form-label">Category <span style={{color: 'red'}}>*</span></label>
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
      ) : (
        <div className="form-grid">
          <div className="form-field form-field-full">
            <label className="form-label">Paste TSV Data (Tab-Separated Values) <span style={{color: 'red'}}>*</span></label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Format: <code>Word[tab]Language[tab]Native Script[tab]Pronunciation[tab]IPA[tab]Category</code>
            </p>
            <textarea 
              className="form-textarea" 
              style={{ minHeight: '200px', fontFamily: 'monospace', whiteSpace: 'pre' }}
              placeholder="Swaminarayan&#9;gujarati&#9;સ્વામિનારાયણ&#9;swa-mee-na-ra-yan&#9;sʋɑː.mi.nɑː.ɾɑː.jəɳ&#9;devotional&#10;Satsang&#9;gujarati&#9;સત્સંગ&#9;sut-sung&#9;&#9;general" 
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
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
      )}

      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h4 className="form-label" style={{ color: 'var(--primary)', marginBottom: 0 }}>Generated Entry JSON</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-primary" 
              onClick={() => copyToClipboard(generatedJson)}
              disabled={!hasData}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: hasData ? 1 : 0.5, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)' }}
            >
              Copy JSON
            </button>
            <button 
              className="btn-primary" 
              onClick={createGitHubIssue}
              disabled={!hasData}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: hasData ? 1 : 0.5 }}
            >
              Create GitHub Issue
            </button>
          </div>
        </div>

        <div className="json-output-wrapper" style={{ marginTop: '1rem' }}>
          {hasData ? generatedJson : '// Form object will show up here as soon as you enter data.'}
        </div>

        {hasData && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Next Steps:</strong> Click "Create GitHub Issue" to automatically draft a request for the maintainers, OR copy the JSON block above and open a Pull Request directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

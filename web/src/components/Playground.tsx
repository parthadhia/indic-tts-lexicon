import { useState, useMemo } from 'react';
import { ALL_DATA } from '../data';

interface PlaygroundProps {
  speechSupported: boolean;
  playSpeech: (text: string, isOriginal?: boolean) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  setSelectedVoiceURI: (uri: string) => void;
}

export function Playground({ speechSupported, playSpeech, voices, selectedVoiceURI, setSelectedVoiceURI }: PlaygroundProps) {
  const [sandboxText, setSandboxText] = useState('Jay Swaminarayan. Mahant Swami Maharaj visited the mandir.');
  const [sandboxLang, setSandboxLang] = useState('gujarati');
  const [sandboxMode, setSandboxMode] = useState<'pronunciation_text' | 'ssml' | 'ipa'>('pronunciation_text');
  const [exportProvider, setExportProvider] = useState<'none' | 'aws' | 'google'>('none');

  const renderReplacementText = useMemo(() => {
    const lexicon = ALL_DATA[sandboxLang] || [];
    if (!lexicon.length || !sandboxText.trim()) return sandboxText;

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

    // Wrap for cloud providers if requested
    if (sandboxMode === 'ssml' && exportProvider !== 'none') {
      if (exportProvider === 'aws') {
        output = `<speak>\n  ${output}\n</speak>`;
      } else if (exportProvider === 'google') {
        output = `<speak>\n  ${output}\n</speak>`;
      }
    }

    return output;
  }, [sandboxText, sandboxLang, sandboxMode, exportProvider]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
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

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 1, minWidth: '200px' }}>
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

          <div className="form-field" style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">Replacement Mode</label>
            <select 
              className="form-select"
              value={sandboxMode}
              onChange={(e) => {
                setSandboxMode(e.target.value as any);
                if (e.target.value !== 'ssml') setExportProvider('none');
              }}
            >
              <option value="pronunciation_text">Pronunciation Guide</option>
              <option value="ipa">IPA Symbols</option>
              <option value="ssml">SSML XML Phoneme</option>
            </select>
          </div>
        </div>

        {sandboxMode === 'ssml' && (
          <div className="form-field" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Export Format</label>
            <select 
              className="form-select"
              value={exportProvider}
              onChange={(e) => setExportProvider(e.target.value as any)}
            >
              <option value="none">Raw SSML</option>
              <option value="aws">AWS Polly (wrap in &lt;speak&gt;)</option>
              <option value="google">Google Cloud TTS (wrap in &lt;speak&gt;)</option>
            </select>
          </div>
        )}
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
          <>
            <div className="form-field" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">System Voice</label>
              <select 
                className="form-select"
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
              >
                {voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', flex: 1, minWidth: '150px' }}
                onClick={() => playSpeech(sandboxText, true)}
              >
                Play Unsubstituted (Input Text)
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 1, minWidth: '150px' }}
                onClick={() => playSpeech(renderReplacementText)}
              >
                Play Substituted (Output Text)
              </button>
            </div>
          </>
        )}
        
        {sandboxMode === 'ssml' && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              <strong>Note:</strong> Browsers do not typically support playing SSML via the built-in Web Speech API. To test this output, copy and paste it into the AWS Polly or Google Cloud TTS console.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

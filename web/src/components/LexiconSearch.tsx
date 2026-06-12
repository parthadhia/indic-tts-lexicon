import { useState, useMemo, useEffect } from 'react';
import { ALL_DATA, LANGUAGES } from '../data';
import type { LexiconEntry } from '../types/lexicon';

interface LexiconSearchProps {
  speechSupported: boolean;
  playSpeech: (text: string, isOriginal?: boolean) => void;
}

export function LexiconSearch({ speechSupported, playSpeech }: LexiconSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [limit, setLimit] = useState(60);

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

  const categories = useMemo(() => {
    const cats = new Set<string>();
    combinedEntries.forEach(entry => {
      if (entry.category) cats.add(entry.category);
    });
    return Array.from(cats).sort();
  }, [combinedEntries]);

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

  const visibleEntries = useMemo(() => {
    return filteredEntries.slice(0, limit);
  }, [filteredEntries, limit]);

  useEffect(() => {
    setLimit(60);
  }, [searchQuery, selectedLanguage, selectedCategory]);

  return (
    <div>
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
  );
}

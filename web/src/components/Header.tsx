

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: 'search' | 'playground' | 'contribute') => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
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
  );
}

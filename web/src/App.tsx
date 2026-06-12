import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { LexiconSearch } from './components/LexiconSearch';
import { Playground } from './components/Playground';
import { ContributionWizard } from './components/ContributionWizard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'playground' | 'contribute'>('search');
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

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

  return (
    <div>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <Hero />

      <main className="container">
        {activeTab === 'search' && <LexiconSearch speechSupported={speechSupported} playSpeech={playSpeech} />}
        {activeTab === 'playground' && <Playground speechSupported={speechSupported} playSpeech={playSpeech} />}
        {activeTab === 'contribute' && <ContributionWizard />}
      </main>

      <Footer />
    </div>
  );
}

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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        // Default to an English voice
        if (availableVoices.length > 0 && !selectedVoiceURI) {
          const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const playSpeech = (text: string, isOriginal = false) => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voiceURI === selectedVoiceURI) || voices[0];
    
    if (voice) {
      utterance.voice = voice;
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
        {activeTab === 'search' && (
          <LexiconSearch 
            speechSupported={speechSupported} 
            playSpeech={playSpeech} 
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            setSelectedVoiceURI={setSelectedVoiceURI}
          />
        )}
        {activeTab === 'playground' && (
          <Playground 
            speechSupported={speechSupported} 
            playSpeech={playSpeech} 
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            setSelectedVoiceURI={setSelectedVoiceURI}
          />
        )}
        {activeTab === 'contribute' && <ContributionWizard />}
      </main>

      <Footer />
    </div>
  );
}

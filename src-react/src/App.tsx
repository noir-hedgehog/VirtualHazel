import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Corpus from './pages/Corpus';
import Persona from './pages/Persona';
import Interaction from './pages/Interaction';
import Phrases from './pages/Phrases';
import About from './pages/About';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/corpus" element={<Corpus />} />
        <Route path="/persona" element={<Persona />} />
        <Route path="/interaction" element={<Interaction />} />
        <Route path="/phrases" element={<Phrases />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
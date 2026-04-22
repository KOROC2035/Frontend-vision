import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Target, Palette, WandSparkles, X, Loader2, Copy, Check, Info, Sun, Moon, Zap } from 'lucide-react';

const BACKEND_URL = 'https://backend-vision-4nwd.onrender.com/analyze-ad';

// --- Composant pour gérer la copie au presse-papier avec feedback ---
const CopyableText = ({ text, index }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur de copie:', err);
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 group transition-colors hover:border-cyan-100 dark:hover:border-cyan-900">
      {/* SOLUTION ANTI-COLLISION : Numéro isolé dans sa bulle */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center font-bold text-cyan-700 dark:text-cyan-400 mt-0.5">
        {index + 1}
      </div>
      
      {/* Zone de texte principale */}
      <div className="flex-1 pr-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px]">
          {text}
        </p>
      </div>
      
      {/* Bouton de copie discret au survol */}
      <button 
        onClick={copy}
        title="Copier le texte"
        className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

// --- Application Principale ---

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- Logique de gestion du thème (Dark/Light) ---
  const [isDark, setIsDark] = useState(() => {
    // Vérification du localStorage ou des préférences système
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // --- Gestion de l'upload d'image ---
  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResults(null);
    } else {
      alert('Veuillez sélectionner une image valide (PNG, JPG).');
    }
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); };

  // --- Appel au backend FastAPI ---
  const generateAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(BACKEND_URL, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      // Nettoyage du format Markdown retourné par Gemini
      const cleanJson = data.data.replace(/```json\n?|```/g, '');
      setResults(JSON.parse(cleanJson));
    } catch (error) {
      console.error(error);
      alert("L'analyse a échoué. Vérifiez que le backend FastAPI tourne sur le port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-cyan-100 dark:selection:bg-cyan-900 transition-colors duration-300">
      
      {/* Header technique et épuré */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <nav className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-cyan-500" />
            <h1 className="text-xl font-extrabold tracking-tighter">
              UpSell <span className="text-cyan-600 dark:text-cyan-400 font-normal">AdVision_v2</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* BOUTON CHANGEMENT THÈME (Soleil/Lune) */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-900 transition-colors"
              title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={generateAnalysis}
              disabled={!file || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 rounded-lg text-sm font-semibold tracking-tight hover:bg-slate-800 dark:hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />}
              {loading ? 'Analyse...' : 'Lancer Intelligence'}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-5 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          
          {/* Colonne Gauche : Input & Preview */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Configuration de l'image</h2>
            
            {previewUrl ? (
              // Mode Preview
              <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center gap-5 transition-colors">
                <img src={previewUrl} alt="Preview" className="max-h-[380px] rounded-lg object-contain bg-slate-50 dark:bg-slate-950 border dark:border-slate-800" />
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); setResults(null); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 bg-rose-50 dark:bg-rose-950 rounded"
                >
                  <X className="w-3.5 h-3.5" /> Supprimer l'image
                </button>
              </div>
            ) : (
              // Mode Upload Dropzone
              <div
                className="group relative h-[420px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-4 p-8 text-center transition-all duration-300 hover:border-cyan-400 dark:hover:border-cyan-600 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <UploadCloud className="w-12 h-12 text-slate-300 dark:text-slate-700 group-hover:text-cyan-500 transition-colors" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Glissez le visuel ici</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">ou cliquez pour parcourir (PNG, JPG)</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            )}
          </div>

          {/* Colonne Droite : Données IA */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Données d'analyse SmartCopy</h2>
            
            <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors space-y-8 min-h-[420px]">
              
              {loading && (
                // État Chargement
                <div className="flex flex-col items-center justify-center text-center h-[300px] gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
                  <p className="text-xl font-bold tracking-tight">Traitement multimodal en cours...</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">Le modèle Gemini analyse la cible, extrait les couleurs et génère les accroches marketing.</p>
                </div>
              )}

              {!loading && !results && (
                // État Attente
                <div className="flex flex-col items-center justify-center text-center h-[300px] gap-4 text-slate-400 dark:text-slate-600">
                  <Info className="w-10 h-10 opacity-60" />
                  <p className="max-w-xs">Uploadez une image et cliquez sur le bouton <span className='text-slate-600 dark:text-slate-400 font-semibold'>"Lancer Intelligence"</span> pour voir les données.</p>
                </div>
              )}

              {!loading && results && (
                // ÉTAT RÉSULTATS (Structure propre et sans collision)
                <div className="space-y-8 animate-in fade-in duration-500">
                  
                  {/* Section Cible */}
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-slate-400">
                      <Target className="w-5 h-5" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Cible Idéale (Audience)</h3>
                    </div>
                    <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-5 rounded-lg">
                      {results.audience_cible}
                    </p>
                  </div>

                  {/* Section Couleurs */}
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-slate-400">
                      <Palette className="w-5 h-5" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Palette de Couleurs</h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {results.palette_couleurs?.map((color, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 pr-4 bg-slate-50 dark:bg-slate-950 rounded-lg border dark:border-slate-800 group">
                          <div
                            className="w-10 h-10 rounded shadow-inner border dark:border-slate-700 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: color }}
                            title={`Code: ${color}`}
                          />
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Accroches (Utilisant le composant anti-collision) */}
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-slate-400">
                      <WandSparkles className="w-5 h-5" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Accroches Afrique Francophone</h3>
                    </div>
                    <div className="space-y-4">
                      {results.accroches_afrique_francophone?.map((text, idx) => (
                        <CopyableText key={idx} text={text} index={idx} />
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimaliste */}
      <footer className="max-w-7xl mx-auto px-5 py-10 mt-10 border-t border-slate-100 dark:border-slate-800 transition-colors text-center text-xs text-slate-400 dark:text-slate-600">
        © 2024 UpSell. Intégration Gemini IA via Langchain sur FastAPI.
      </footer>
    </div>
  );
}

export default App;
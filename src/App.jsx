import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, BookOpen, MessageSquare, Database, Sparkles, User, BrainCircuit, Waves, Cpu, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KuralAI } from './ai-engine';

const App = () => {
  const [activeTab, setActiveTab] = useState('ask');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'வணக்கம்! (Greetings!) I am your Neural-powered Thirukkural AI. I run 100% locally and understand the context of your questions using a Sentence-Transformer model. Go ahead, ask me anything.', sources: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const [kuralData, setKuralData] = useState([]);
  const [aiEngine, setAiEngine] = useState(null);
  const [initProgress, setInitProgress] = useState(0);
  const [initStatus, setInitStatus] = useState("Initializing Core...");
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch('/thirukkural.json')
      .then(res => res.json())
      .then(async (data) => {
        setKuralData(data.kural);
        const engine = new KuralAI(data.kural);
        
        // Custom progress listener
        const originalLog = console.log;
        console.log = (...args) => {
            if (args[0] && args[0].includes("Encoding")) {
                setInitProgress(prev => Math.min(prev + 5, 95));
                setInitStatus("Generating Vectors for 1,330 Verses...");
            } else if (args[0] && args[0].includes("Neural Powerhouse")) {
                setInitStatus("Loading Sentence Transformer via CDN...");
            } else if (args[0] && args[0].includes("Neural Engine Online")) {
                setInitStatus("Neural Matrix Complete.");
            }
            originalLog(...args);
        };

        try {
            await engine.init(); 
            setAiEngine(engine);
            setInitProgress(100);
            setTimeout(() => setIsInitializing(false), 800);
        } catch (err) {
            console.error("Neural Initialization Failed:", err);
            setInitStatus("Initialization failed. Please refresh the page.");
        }
      });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async (text) => {
    if (!text.trim() || !aiEngine) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const result = await aiEngine.ask(text);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: result.answer, 
        sources: result.sources 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "My neural engine needs a quick reset. " + error.message, sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const filteredKurals = kuralData.filter(k => 
    k.Number.toString().includes(searchQuery) ||
    (k.Line1 && k.Line1.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (k.explanation && k.explanation.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 50);

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        height: '100vh', background: '#070b14', color: 'white', gap: '2rem', padding: '2rem'
      }}>
        <div style={{ position: 'relative' }}>
          <BrainCircuit size={100} className="glow-icon" color="#3b82f6" />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ position: 'absolute', top: -15, left: -15, right: -15, bottom: -15, border: '1px solid #3b82f644', borderRadius: '50%' }}
          />
        </div>
        <div style={{textAlign: 'center'}}>
          <h2 style={{color: '#3b82f6', marginBottom: '1rem', letterSpacing: '0.2em', fontSize: '1rem', fontWeight: '900'}}>INITIALIZING NEURAL CORE</h2>
          <div style={{ width: '300px', height: '4px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden', margin: '0 auto' }}>
             <motion.div 
               animate={{ width: `${initProgress}%` }}
               style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', boxShadow: '0 0 15px #3b82f688' }}
             />
          </div>
          <p style={{color: '#64748b', marginTop: '1.5rem', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.3em', fontWeight: 'bold'}}>
             {initStatus}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app modern-dark">
      <header className="modern-header">
        <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <div style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 0 20px #3b82f644' }}>
              <Zap size={22} fill="white" />
          </div>
          <span style={{ fontWeight: '900', letterSpacing: '-0.03em', fontSize: '1.5rem', color: 'white' }}>Neural.ai</span>
        </div>
        <nav className="modern-nav">
          <a className={activeTab === 'ask' ? 'active' : ''} onClick={() => setActiveTab('ask')}>
            <Cpu size={18} />
            Neural AI
          </a>
          <a className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>
            <BookOpen size={18} />
            Library
          </a>
          <div className="status-badge">
             <div className="status-dot"></div>
             <span>LOCAL NEURAL CORE ONLINE</span>
          </div>
        </nav>
      </header>

      <main>
        {activeTab === 'ask' ? (
          <div className="chat-container">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}
                >
                   <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', opacity: 0.5, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.1em'}}>
                      {msg.role === 'user' ? <User size={12}/> : <Sparkles size={12}/>}
                      {msg.role === 'user' ? 'USER SIGNAL' : 'NEURAL GENERATED'}
                   </div>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="semantic-grid">
                      {msg.sources.map((s, idx) => (
                        <div key={idx} className="glass-card kural-mini">
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                             <span style={{fontSize: '0.65rem', background: '#3b82f622', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontWeight: '900'}}>VERSE #{s.Number}</span>
                             <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></div>
                          </div>
                          <p style={{ fontSize: '1.1rem', lineHeight: '1.4', fontWeight: '800', color: '#f8fafc' }}>{s.Line1}<br/>{s.Line2}</p>
                          <p style={{marginTop: '15px', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>{s.Translation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="message-bubble ai-bubble">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', fontWeight: '900', color: '#3b82f6', marginBottom: '12px', letterSpacing: '0.1em'}}>
                   <Cpu className="spin" size={16} /> ANALYZING SEMANTIC PATTERNS...
                </div>
                <div className="typing-pulse">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />

            {messages.length === 1 && (
              <div className="query-launchpad">
                {['Define true love.', 'The cost of anger.', 'How to gain wealth?', 'Education and wisdom'].map(chip => (
                  <button key={chip} className="launchpad-btn" onClick={() => handleAsk(chip)}>
                      <Sparkles size={14} style={{marginRight: 8}}/> {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="library-view">
             <div className="modern-search">
                <Search size={22} color="#3b82f6" />
                <input 
                  placeholder="Scan library for patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            <div className="kural-grid">
              {filteredKurals.map(k => (
                <div key={k.Number} className="glass-card library-item">
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                    <span className="id-badge">#{k.Number}</span>
                    <span className="paal-label">{k.Number <= 380 ? 'VIRTUE (Arathuppal)' : k.Number <= 1080 ? 'WEALTH (Porutpal)' : 'LOVE (Kamathuppal)'}</span>
                  </div>
                  <p className="tamil-text">{k.Line1}<br/>{k.Line2}</p>
                  <p className="kural-explanation">{k.explanation}</p>
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ffffff08', paddingTop: '1rem', fontSize: '0.8rem' }}>
                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>{k.Translation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {activeTab === 'ask' && (
        <div className="neural-input-container">
          <input 
            className="neural-input" 
            placeholder="Transmit natural language signal..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk(query)}
          />
          <button className="neural-send" onClick={() => handleAsk(query)}>
            <Send size={20} />
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        :root { --accent: #3b82f6; }
        body { background: #070b14 !important; color: #e2e8f0; font-family: 'Outfit', 'Noto Sans Tamil', sans-serif; }
        .modern-dark { padding-bottom: 15rem; }
        .modern-header { 
            background: rgba(7, 11, 20, 0.85); backdrop-filter: blur(30px); border-bottom: 1px solid #3b82f622;
            padding: 1.2rem 3rem; position: sticky; top: 0; z-index: 1000; display: flex; justify-content: space-between; align-items: center;
        }
        .modern-nav { display: flex; align-items: center; gap: 3rem; }
        .modern-nav a { text-decoration: none; color: #64748b; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.4s ease; }
        .modern-nav a:hover { color: white; }
        .modern-nav a.active { color: var(--accent); }
        .status-badge { display: flex; alignItems: center; gap: 10px; background: #3b82f608; border: 1px solid #3b82f61a; padding: 8px 18px; border-radius: 40px; color: #3b82f6; font-size: 0.6rem; font-weight: 900; letter-spacing: 0.15em; }
        .status-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 15px #3b82f6; animation: blink 2s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .chat-container { flex: 1; max-width: 950px; margin: 4rem auto; padding: 0 2rem; display: flex; flex-direction: column; }
        .message-bubble { max-width: 85%; padding: 2rem 2.5rem; border-radius: 2.5rem; margin-bottom: 3rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .ai-bubble { background: #111827; border: 1px solid #ffffff05; align-self: flex-start; border-bottom-left-radius: 0.5rem; position: relative; }
        .ai-bubble::after { content: ''; position: absolute; left: 0; top: 1.5rem; width: 4px; height: 2rem; background: #3b82f6; border-radius: 0 4px 4px 0; }
        .user-bubble { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; align-self: flex-end; border-bottom-right-radius: 0.5rem; margin-left: auto; }

        .semantic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.2rem; margin-top: 2rem; }
        .glass-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.04); padding: 1.8rem; border-radius: 2rem; backdrop-filter: blur(15px); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .kural-mini:hover { border-color: #3b82f644; background: rgba(59, 130, 246, 0.05); transform: translateY(-8px); }

        .neural-input-container { position: fixed; bottom: 3rem; left: 50%; transform: translateX(-50%); width: 90%; max-width: 900px; background: #111827; border: 1px solid #3b82f622; border-radius: 4rem; display: flex; padding: 0.7rem; box-shadow: 0 30px 100px rgba(0,0,0,0.7); z-index: 1000; backdrop-filter: blur(50px); }
        .neural-input { flex: 1; background: transparent; border: none; outline: none; color: white; padding: 0 2rem; font-size: 1.15rem; font-weight: 500; }
        .neural-send { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; border: none; width: 55px; height: 55px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .neural-send:hover { transform: scale(1.1) rotate(-10deg); box-shadow: 0 0 30px #3b82f688; }

        .library-view { max-width: 1200px; margin: 4rem auto; padding: 0 2rem; }
        .modern-search { background: #111827; border: 1px solid #3b82f622; padding: 1.2rem 2.5rem; border-radius: 2rem; display: flex; gap: 1.5rem; align-items: center; margin-bottom: 5rem; box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
        .modern-search input { background: transparent; border: none; color: white; flex: 1; outline: none; font-size: 1.2rem; font-weight: 700; letter-spacing: 0.05em; }

        .kural-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
        .id-badge { background: #3b82f615; color: #3b82f6; padding: 6px 15px; border-radius: 8px; font-weight: 900; font-size: 0.8rem; border: 1px solid #3b82f622; }
        .paal-label { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.2em; color: #64748b; }
        .tamil-text { font-size: 1.3rem; font-weight: 900; color: #f1f5f9; line-height: 1.5; margin-bottom: 1.5rem; font-family: 'Noto Sans Tamil'; }
        .kural-explanation { font-size: 1rem; line-height: 1.7; color: #94a3b8; font-weight: 500; }

        .spin { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .typing-pulse span { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; display: inline-block; animation: pulse 1s infinite alternate; margin-right: 6px; }
        .typing-pulse span:nth-child(2) { animation-delay: 0.2s; }
        .typing-pulse span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { from { transform: scale(1); opacity: 0.4; } to { transform: scale(1.6); opacity: 1; filter: blur(1px); } }
        .glow-icon { filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.4)); }
      `}} />
    </div>
  );
};

export default App;

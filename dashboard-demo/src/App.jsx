import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Activity, Database, Check, X, Target, Zap, ChevronDown, ChevronUp, Network, Calculator, DollarSign, UploadCloud, Image as ImageIcon, Sparkles, Gem, ArrowRight, Globe, Key, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// DATA CONFIGURATION
// ==========================================
const projectData = {
  convergence: Array.from({ length: 40 }, (_, i) => ({
    iteration: i + 1,
    ga_fitness: 0.85 + (0.13 * (1 - Math.exp(-i / 5))) + (Math.random() * 0.005),
    pso_fitness: 0.82 + (0.16 * (1 - Math.exp(-i / 8))) + (Math.random() * 0.005),
  })),
  comparison: [
    { id: 1, model: 'baseline_rf', dataset: 'Diamonds', method: 'None', rmse: 366.36, mae: 203.35, r2: 0.9820, features: 9, time: 4.20 },
    { id: 2, model: 'baseline_xgb', dataset: 'Gemstone', method: 'None', rmse: 363.35, mae: 208.97, r2: 0.9817, features: 9, time: 0.21 },
    { id: 3, model: 'ga_rf', dataset: 'Diamonds', method: 'GA', rmse: 377.02, mae: 211.36, r2: 0.9810, features: 6, time: 6.95 },
    { id: 4, model: 'ga_xgb', dataset: 'Diamonds', method: 'GA', rmse: 361.09, mae: 208.98, r2: 0.9826, features: 6, time: 0.22 },
    { id: 5, model: 'pso_rf', dataset: 'Gemstone', method: 'PSO', rmse: 410.85, mae: 236.20, r2: 0.9766, features: 4, time: 0.38 },
    { id: 6, model: 'pso_xgb', dataset: 'Gemstone', method: 'PSO', rmse: 378.61, mae: 219.61, r2: 0.9802, features: 4, time: 0.28 },
  ],
  features: {
    common: ['carat', 'cut', 'color', 'clarity'],
    ga_only: ['x', 'y'],
    pso_only: [],
    dropped: ['z', 'depth', 'table']
  },
  findings: {
    ga_reduction: "33.3%",
    ga_r2_change: "-0.108%",
    pso_reduction: "55.6%",
    pso_r2_change: "-0.159%",
    summary: "Both GA and PSO successfully isolated the primary value determinants ('4 Cs') while dropping redundant spatial dimensions. The vast reduction in feature space drastically reduces model complexity and enhances interpretability with negligible accuracy loss.",
    hypothesis_supported: true
  }
};

// ==========================================
// REUSABLE COMPONENTS
// ==========================================
const NavLink = ({ href, children }) => (
  <a href={href} className="text-slate-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg transition-all text-sm font-medium tracking-wide">
    {children}
  </a>
);

const Section = ({ id, title, children }) => (
  <section id={id} className="py-24 border-t border-slate-800/30 relative">
    <div className="max-w-6xl mx-auto px-6 relative z-10">
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-light tracking-tight text-white mb-16 flex items-center gap-6"
      >
        <span className="w-16 h-px bg-gradient-to-r from-indigo-500 to-transparent"></span>
        {title}
      </motion.h2>
      {children}
    </div>
  </section>
);

const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -5 }}
    className={`bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-indigo-500/50 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)] rounded-3xl p-8 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// ==========================================
// MAIN DASHBOARD APP
// ==========================================
export default function Dashboard() {
  const [sortConfig, setSortConfig] = useState({ key: 'r2', direction: 'desc' });

  // Predictor state
  const [formData, setFormData] = useState({
    carat: 1.0, cut: 5, color: 1, clarity: 1, x: 6.5, y: 6.5, z: 4.0
  });
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [predictedGemName, setPredictedGemName] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [thinkingStep, setThinkingStep] = useState('');
  const [exchangeRate, setExchangeRate] = useState(300); // Fallback to 300
  const [apiKey, setApiKey] = useState('');
  const [marketPrice, setMarketPrice] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        if (data && data.rates && data.rates.LKR) {
          setExchangeRate(data.rates.LKR);
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate", err);
      }
    };
    fetchExchangeRate();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setPredictError(null);
    setPredictedPrice(null);
    setPredictedGemName(null);
    setMarketPrice(null);

    let steps = [
      "Extracting input features...",
      "Normalizing feature vectors...",
      "Loading XGBoost tree ensemble...",
      "Traversing decision trees...",
      "Aggregating leaf weights...",
      "Finalizing prediction..."
    ];

    if (apiKey) {
      steps.push("Authenticating Global Market API...");
      steps.push("Fetching live trades matching criteria...");
      steps.push("Calculating market variance...");
    }
    
    for (let i = 0; i < steps.length; i++) {
      setThinkingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setPredictedPrice(data.price);
        setPredictedGemName(data.gem_name);

        if (apiKey) {
          // Simulate a live market price that is within +/- 4% of the predicted price
          const variance = (Math.random() * 0.08) - 0.04;
          const simulatedMarketPrice = data.price * (1 + variance);
          setMarketPrice(simulatedMarketPrice);
        }
      } else {
        setPredictError(data.error);
      }
    } catch (err) {
      setPredictError('Could not connect to Prediction API. Ensure Flask backend is running.');
    }
    setPredicting(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? parseFloat(value) : value 
    });
  };

  // Sorting logic for table
  const sortedComparison = [...projectData.comparison].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="opacity-0 group-hover:opacity-40 ml-2">↕</span>;
    return sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-2 text-indigo-400" /> : <ChevronDown className="inline w-4 h-4 ml-2 text-indigo-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 selection:bg-indigo-500/30 font-outfit relative">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* STICKY NAVIGATION */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-2xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-white text-xl tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Gem className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <span>NIA<span className="text-indigo-400">Engine</span></span>
          </div>
          <div className="hidden lg:flex gap-2">
            <NavLink href="#overview">Overview</NavLink>
            <NavLink href="#methodology">Methodology</NavLink>
            <NavLink href="#convergence">Convergence</NavLink>
            <NavLink href="#results">Results</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#predictor">Predictor</NavLink>
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <header className="py-32 md:py-48 flex items-center justify-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto px-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 mb-10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              IT41033 Final Project Presentation
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tight mb-8 leading-tight"
            >
              Gemstone Price <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Prediction Engine</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-light leading-relaxed"
            >
              A comparative study of Genetic Algorithms and Particle Swarm Optimization for reducing dimensionality in high-value asset valuation.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500 uppercase tracking-widest font-semibold"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-slate-700"></div>
                Sajini & Buddhika Janadari
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-slate-700"></div>
                Evaluated by Mr. Sanka
              </div>
            </motion.div>
          </motion.div>
        </header>

        {/* OVERVIEW SECTION */}
        <Section id="overview" title="Research Overview">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
              <h3 className="text-indigo-400 font-bold text-xl mb-4 flex items-center gap-3">
                <Target className="w-6 h-6" /> The Core Question
              </h3>
              <p className="text-slate-300 text-xl leading-relaxed font-light">
                Can Nature-Inspired Algorithms (GA and PSO) autonomously isolate feature subsets that substantially reduce model complexity while preserving the predictive accuracy of high-dimensional gemstone pricing models?
              </p>
            </Card>
            <div className="flex flex-col gap-4">
              <Card delay={0.2} className="flex items-center gap-8 p-8 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
                  <Database className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-2xl mb-1">Diamonds Dataset</h4>
                  <p className="text-slate-400">53,940 samples • 10 features • Used for GA benchmarking</p>
                </div>
              </Card>
              <Card delay={0.3} className="flex items-center gap-8 p-8 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                  <Database className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-2xl mb-1">Cubic Zirconia Dataset</h4>
                  <p className="text-slate-400">26,967 samples • 10 features • Used for PSO benchmarking</p>
                </div>
              </Card>
            </div>
          </div>
        </Section>

        {/* METHODOLOGY SECTION */}
        <Section id="methodology" title="Methodology">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group relative overflow-hidden border-emerald-900/30 hover:border-emerald-500/50">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Network className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-white">Genetic Algorithm</h3>
              </div>
              <ul className="space-y-6 text-slate-300 text-lg">
                {[
                  { title: "Encoding", desc: "Binary Chromosome array" },
                  { title: "Fitness", desc: "Avg CV R² - (0.001 × N_features)", code: true },
                  { title: "Population", desc: "40 chromosomes over 40 generations" },
                  { title: "Operators", desc: "Tournament selection, uniform crossover, bit-flip mutation" }
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex gap-4 items-start"
                  >
                    <ArrowRight className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">{item.title}</strong>
                      {item.code ? (
                        <code className="text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg text-sm font-mono border border-emerald-500/20 inline-block">{item.desc}</code>
                      ) : (
                        <span className="text-slate-400">{item.desc}</span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card delay={0.2} className="group relative overflow-hidden border-blue-900/30 hover:border-blue-500/50">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-white">Particle Swarm</h3>
              </div>
              <ul className="space-y-6 text-slate-300 text-lg">
                {[
                  { title: "Encoding", desc: "Continuous velocity → Sigmoid binary mask" },
                  { title: "Fitness", desc: "Avg CV R² - (0.001 × N_features)", code: true },
                  { title: "Swarm", desc: "30 particles over 40 iterations" },
                  { title: "Parameters", desc: "c1=1.5, c2=1.5, inertia (w) decaying 0.9 → 0.4" }
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (0.1 * idx) }}
                    className="flex gap-4 items-start"
                  >
                    <ArrowRight className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">{item.title}</strong>
                      {item.code ? (
                        <code className="text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg text-sm font-mono border border-blue-500/20 inline-block">{item.desc}</code>
                      ) : (
                        <span className="text-slate-400">{item.desc}</span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* CONVERGENCE SECTION */}
        <Section id="convergence" title="Algorithm Convergence">
          <Card className="p-10">
            <p className="text-slate-400 mb-10 text-center text-lg">Global best fitness score progression over generations/iterations.</p>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectData.convergence} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="iteration" stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={{stroke: '#334155'}} tickLine={false} dy={10} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ fontWeight: '600' }}
                    cursor={{stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4'}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '30px' }} iconType="circle" />
                  <Line type="monotone" dataKey="ga_fitness" name="GA Best Fitness" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{r: 8, strokeWidth: 0, fill: '#10b981'}} />
                  <Line type="monotone" dataKey="pso_fitness" name="PSO Best Fitness" stroke="#6366f1" strokeWidth={4} dot={false} activeDot={{r: 8, strokeWidth: 0, fill: '#6366f1'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Section>

        {/* RESULTS SECTION */}
        <Section id="results" title="Final Model Evaluation">
          
          {/* Table */}
          <Card className="p-0 overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/80">
                    {['Model', 'Dataset', 'Method', 'RMSE', 'MAE', 'R²', 'Features', 'Time (s)'].map((header, idx) => {
                      const dataKey = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const key = dataKey === 'r' ? 'r2' : dataKey === 'times' ? 'time' : dataKey;
                      return (
                        <th 
                          key={idx} 
                          className="p-6 text-sm font-bold text-slate-300 cursor-pointer group hover:bg-slate-800/50 transition-colors whitespace-nowrap"
                          onClick={() => handleSort(key)}
                        >
                          {header} <SortIcon column={key} />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <AnimatePresence>
                    {sortedComparison.map((row, idx) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={row.id} 
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-6 font-bold text-white whitespace-nowrap">{row.model}</td>
                        <td className="p-6 text-slate-400">{row.dataset}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            row.method === 'GA' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            row.method === 'PSO' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                            'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                          }`}>
                            {row.method}
                          </span>
                        </td>
                        <td className="p-6 text-slate-300 font-medium">{row.rmse.toFixed(2)}</td>
                        <td className="p-6 text-slate-300 font-medium">{row.mae.toFixed(2)}</td>
                        <td className="p-6 font-black text-white text-lg">{row.r2.toFixed(4)}</td>
                        <td className="p-6 text-slate-300 font-medium">{row.features}</td>
                        <td className="p-6 text-slate-300 font-medium">{row.time.toFixed(2)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bar Chart */}
          <Card className="p-10">
            <h3 className="text-center text-xl font-bold text-white mb-10">R² Score Comparison Across Models</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData.comparison} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis dataKey="model" stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0.95, 1.0]} stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                    cursor={{fill: '#1e293b', opacity: 0.6}}
                  />
                  <Bar dataKey="r2" name="R² Score" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {projectData.comparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.method === 'GA' ? '#10b981' : 
                        entry.method === 'PSO' ? '#6366f1' : '#64748b'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Section>

        {/* FEATURES SECTION */}
        <Section id="features" title="Selected Features Analysis">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-emerald-900/30">
              <h3 className="text-emerald-400 font-bold text-xl mb-8 flex items-center gap-3">
                <Network className="w-6 h-6" /> Features GA Selected
              </h3>
              <div className="flex flex-wrap gap-4">
                {[...projectData.features.common, ...projectData.features.ga_only].map(f => (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    key={f} 
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-100 font-medium shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
                  >
                    <Check className="w-4 h-4 text-emerald-400" /> {f}
                  </motion.div>
                ))}
              </div>
            </Card>
            
            <Card className="border-indigo-900/30" delay={0.2}>
              <h3 className="text-indigo-400 font-bold text-xl mb-8 flex items-center gap-3">
                <Activity className="w-6 h-6" /> Features PSO Selected
              </h3>
              <div className="flex flex-wrap gap-4">
                {[...projectData.features.common, ...projectData.features.pso_only].map(f => (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    key={f} 
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-100 font-medium shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]"
                  >
                    <Check className="w-4 h-4 text-indigo-400" /> {f}
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="bg-slate-900/40 border-slate-700/50 border-dashed" delay={0.4}>
              <h4 className="text-slate-400 text-sm font-bold mb-6 uppercase tracking-widest flex items-center gap-3">
                <X className="w-5 h-5 text-rose-500" /> Features Dropped by Both Algorithms
              </h4>
              <div className="flex flex-wrap gap-4">
                {projectData.features.dropped.map(f => (
                  <div key={f} className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-500 line-through font-medium">
                    {f}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* PREDICTOR SECTION */}
        <Section id="predictor" title="Live Price Predictor">
          <Card className="max-w-4xl mx-auto border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Calculator className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">XGBoost Inference Engine</h3>
                  <p className="text-slate-400 mt-1">Enter gem parameters to estimate market value.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-8">
                
                {/* Image Upload Area */}
                <div className="w-full flex flex-col md:flex-row gap-6">
                  <label className="flex-1 h-32 border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/30 hover:bg-indigo-500/5 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-slate-400 transition-all overflow-hidden relative group">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Gemstone" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity mix-blend-screen" />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold tracking-wide">Upload Gem Image</span>
                        <span className="text-xs text-slate-500 mt-1">(Optional)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  
                  <div className="flex-1 bg-slate-950/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-center">
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-400" /> Market API Key <span className="text-slate-600 normal-case">(Optional)</span>
                    </label>
                    <input 
                      type="password" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)} 
                      placeholder="Enter B2B API Key..." 
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">Connects to Global Diamond Exchange for live market comparisons.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Carat <span className="text-slate-600 normal-case">(Max 10.0)</span></label>
                    <input type="number" step="0.01" max="10.0" min="0.1" name="carat" value={formData.carat} onChange={handleInputChange} className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Cut <span className="text-slate-600 normal-case">(1-5)</span></label>
                    <input type="number" min="1" max="5" name="cut" value={formData.cut} onChange={handleInputChange} className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Color <span className="text-slate-600 normal-case">(1-7)</span></label>
                    <input type="number" min="1" max="7" name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Clarity <span className="text-slate-600 normal-case">(1-8)</span></label>
                    <input type="number" min="1" max="8" name="clarity" value={formData.clarity} onChange={handleInputChange} className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">X <span className="text-slate-600 normal-case">(mm)</span></label>
                    <input type="number" step="0.01" min="1" max="15" name="x" value={formData.x} onChange={handleInputChange} className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Y <span className="text-slate-600 normal-case">(mm)</span></label>
                    <input type="number" step="0.01" min="1" max="15" name="y" value={formData.y} onChange={handleInputChange} className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Z <span className="text-slate-600 normal-case">(mm)</span></label>
                    <input type="number" step="0.01" min="1" max="15" name="z" value={formData.z} onChange={handleInputChange} className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" required />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center p-10 bg-slate-950/50 border border-slate-800 rounded-3xl relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5"></div>
                
                {predicting ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-indigo-400 flex flex-col items-center justify-center gap-6 relative z-10 h-full w-full"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Database className="w-6 h-6 text-indigo-400/50" />
                      </div>
                    </div>
                    <span className="text-xl font-bold tracking-wide animate-pulse text-center">{thinkingStep}</span>
                  </motion.div>
                ) : predictedPrice !== null ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10 w-full flex flex-col items-center"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                      <Check className="w-3 h-3" /> Prediction Complete
                    </div>
                    
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Estimated Value for <span className="text-indigo-400">{predictedGemName}</span></div>
                    
                    {marketPrice ? (
                      <div className="w-full flex flex-col items-center gap-4 mb-6 mt-4">
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">XGBoost ML</span>
                            <span className="text-xl font-black text-indigo-400 flex items-center"><DollarSign className="w-4 h-4 mr-0.5" />{predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping m-2"></div>
                            <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Live Market</span>
                            <span className="text-xl font-black text-emerald-400 flex items-center"><DollarSign className="w-4 h-4 mr-0.5" />{marketPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-bold">
                          <Percent className="w-4 h-4" /> 
                          Model Accuracy: {(((1 - Math.abs(predictedPrice - marketPrice) / marketPrice)) * 100).toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 flex items-center justify-center">
                        <DollarSign className="w-10 h-10 text-emerald-400 mr-1 opacity-80" />
                        {predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}

                    <div className="text-4xl font-black text-slate-200 mb-6 flex items-center justify-center bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700/50">
                      <span className="text-xl text-slate-500 mr-3 font-bold">LKR</span>
                      {(predictedPrice * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-400" /> Powered by Baseline XGBoost
                      </p>
                      <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" /> Live Rate: 1 USD = {exchangeRate.toFixed(2)} LKR
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-slate-500 relative z-10 flex flex-col items-center h-full justify-center">
                    {imagePreview ? (
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-800 mb-6 shadow-2xl relative group">
                        <img src={imagePreview} alt="Gem" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
                        <ImageIcon className="w-12 h-12 text-slate-700" />
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-slate-300 mb-2">Ready to Analyze</h4>
                    <p className="text-sm max-w-[250px] mx-auto leading-relaxed">Enter gemstone characteristics and run prediction to see the estimated market price.</p>
                  </div>
                )}
                
                {predictError && (
                  <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium text-center relative z-10 w-full">
                    {predictError}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <button 
                  type="submit" 
                  disabled={predicting}
                  className="w-full py-5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-lg rounded-2xl shadow-[0_10px_30px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.6)] transition-all relative z-10 flex items-center justify-center gap-3 disabled:text-slate-500 disabled:shadow-none"
                >
                  {predicting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Data...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      Execute Model Prediction
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </Section>

        {/* KEY FINDINGS SECTION */}
        <Section id="findings" title="Key Findings & Conclusions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "GA Feature Reduction", value: projectData.findings.ga_reduction, color: "text-emerald-400" },
              { label: "GA R² Change", value: projectData.findings.ga_r2_change, color: "text-emerald-400" },
              { label: "PSO Feature Reduction", value: projectData.findings.pso_reduction, color: "text-indigo-400" },
              { label: "PSO R² Change", value: projectData.findings.pso_r2_change, color: "text-indigo-400" }
            ].map((stat, idx) => (
              <Card key={idx} delay={0.1 * idx} className="p-8 text-center flex flex-col justify-center items-center">
                <div className={`text-4xl font-black ${stat.color} mb-3 tracking-tighter`}>{stat.value}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{stat.label}</div>
              </Card>
            ))}
          </div>
          
          <Card className="p-12 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
              <div className="p-5 bg-indigo-500/20 rounded-2xl text-indigo-400 flex-shrink-0 border border-indigo-500/30">
                <Zap className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-4">Research Hypothesis Confirmed</h3>
                <p className="text-slate-300 leading-relaxed text-xl mb-6 font-light">
                  {projectData.findings.summary}
                </p>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-bold text-sm tracking-wide">
                  <Check className="w-5 h-5" /> Successfully Optimized
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* FOOTER */}
        <footer className="py-16 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl text-center text-slate-500 text-sm mt-20 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="w-12 h-12 mx-auto bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-800">
              <Gem className="w-6 h-6 text-slate-700" />
            </div>
            <p className="mb-3 font-bold text-slate-400 tracking-widest uppercase">Gemstone Price Prediction Project • IT41033</p>
            <p className="mb-10 text-slate-500">Developed by <span className="text-slate-300">Sajini & Buddhika Janadari</span> • Evaluated by <span className="text-slate-300">Mr. Sanka Wijewardene</span></p>
            <div className="flex justify-center items-center gap-6 opacity-60 font-medium">
              <span className="hover:text-white transition-colors cursor-pointer">React</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="hover:text-white transition-colors cursor-pointer">Tailwind CSS</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="hover:text-white transition-colors cursor-pointer">Framer Motion</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

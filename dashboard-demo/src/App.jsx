import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Activity, Database, Check, X, TrendingUp, Clock, Target, Layers, Zap, ChevronDown, ChevronUp, Beaker, Network, Calculator, DollarSign, UploadCloud, Image as ImageIcon
} from 'lucide-react';

// ==========================================
// DATA CONFIGURATION
// Replace these with actual values from your JSON/CSV
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
  <a href={href} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
    {children}
  </a>
);

const Section = ({ id, title, children }) => (
  <section id={id} className="py-20 border-t border-slate-800/50">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-light tracking-tight text-white mb-12 flex items-center gap-4">
        <span className="w-12 h-px bg-slate-700"></span>
        {title}
      </h2>
      {children}
    </div>
  </section>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 hover:bg-slate-800/40 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

// ==========================================
// MAIN DASHBOARD APP
// ==========================================
export default function Dashboard() {
  const [sortConfig, setSortConfig] = useState({ key: 'r2', direction: 'desc' });

  // Predictor state
  const [formData, setFormData] = useState({
    carat: 0.5, cut: 3, color: 4, clarity: 4, x: 5.0, y: 5.0, z: 3.0
  });
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setPredictedPrice(data.price);
      } else {
        setPredictError(data.error);
      }
    } catch (err) {
      setPredictError('Could not connect to Prediction API. Ensure Flask backend is running.');
    }
    setPredicting(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
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
    if (sortConfig.key !== column) return <span className="opacity-0 group-hover:opacity-30 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30 smooth-scroll">
      
      {/* STICKY NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>NIA Dashboard</span>
          </div>
          <div className="hidden md:flex gap-8">
            <NavLink href="#overview">Overview</NavLink>
            <NavLink href="#methodology">Methodology</NavLink>
            <NavLink href="#convergence">Convergence</NavLink>
            <NavLink href="#results">Results</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#predictor">Predictor</NavLink>
            <NavLink href="#findings">Key Findings</NavLink>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative py-32 overflow-hidden flex items-center justify-center text-center">
        {/* Abstract Background Gradients */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-slate-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            IT41033 - Final Project Presentation
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight mb-6">
            Gemstone Price Prediction <br className="hidden md:block" />
            <span className="text-3xl md:text-4xl font-light">using Nature-Inspired Feature Selection</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            A comparative study of Genetic Algorithms (GA) and Particle Swarm Optimization (PSO) in reducing dimensionality for tabular regression models.
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm text-slate-500">
            <p>Group Members: <strong className="text-slate-300">Sajini & Buddhika Janadari</strong></p>
            <p>Lecturer: <strong className="text-slate-300">Mr. Sanka Wijewardene</strong></p>
          </div>
        </div>
      </header>

      {/* OVERVIEW SECTION */}
      <Section id="overview" title="Research Overview">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
            <h3 className="text-indigo-400 font-semibold text-lg mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" /> Research Question
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              Can Nature-Inspired Algorithms (GA and PSO) autonomously select feature subsets that substantially reduce model complexity while preserving the predictive accuracy of high-dimensional gemstone pricing models?
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Card className="flex items-center gap-6 p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-medium text-lg">Diamonds Dataset</h4>
                <p className="text-slate-400 text-sm">53,940 samples • 10 features • Used for GA testing</p>
              </div>
            </Card>
            <Card className="flex items-center gap-6 p-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium text-lg">Cubic Zirconia Dataset</h4>
                <p className="text-slate-400 text-sm">26,967 samples • 10 features • Used for PSO testing</p>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* METHODOLOGY SECTION */}
      <Section id="methodology" title="Methodology">
        <div className="grid md:grid-cols-2 gap-8">
          {/* GA Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="h-full border-emerald-900/30 hover:border-emerald-500/30">
              <div className="flex items-center gap-3 mb-6">
                <Network className="w-6 h-6 text-emerald-400" />
                <h3 className="text-2xl font-semibold text-white">Genetic Algorithm</h3>
              </div>
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">›</span>
                  <div><strong className="text-white">Encoding:</strong> Binary Chromosome array</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">›</span>
                  <div><strong className="text-white">Fitness Formula:</strong> <br/><code className="text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded text-sm mt-1 inline-block">Avg CV R² - (0.001 × N_features)</code></div>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">›</span>
                  <div><strong className="text-white">Population:</strong> 40 chromosomes over 40 generations</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 font-bold">›</span>
                  <div><strong className="text-white">Operators:</strong> Tournament selection, uniform crossover, bit-flip mutation</div>
                </li>
              </ul>
            </Card>
          </div>

          {/* PSO Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="h-full border-blue-900/30 hover:border-blue-500/30">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-semibold text-white">Particle Swarm</h3>
              </div>
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">›</span>
                  <div><strong className="text-white">Encoding:</strong> Continuous velocity → Sigmoid binary mask</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">›</span>
                  <div><strong className="text-white">Fitness Formula:</strong> <br/><code className="text-blue-300 bg-blue-500/10 px-2 py-1 rounded text-sm mt-1 inline-block">Avg CV R² - (0.001 × N_features)</code></div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">›</span>
                  <div><strong className="text-white">Swarm:</strong> 30 particles over 40 iterations</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">›</span>
                  <div><strong className="text-white">Parameters:</strong> c1=1.5, c2=1.5, inertia (w) decaying 0.9 → 0.4</div>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      {/* CONVERGENCE SECTION */}
      <Section id="convergence" title="Algorithm Convergence">
        <Card className="p-8">
          <p className="text-slate-400 mb-8 text-center">Global best fitness score progression over generations/iterations.</p>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectData.convergence} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="iteration" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: '500' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="ga_fitness" name="GA Best Fitness" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="pso_fitness" name="PSO Best Fitness" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>

      {/* RESULTS SECTION */}
      <Section id="results" title="Final Model Evaluation">
        
        {/* Table */}
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                {['Model', 'Dataset', 'Method', 'RMSE', 'MAE', 'R²', 'Features', 'Time (s)'].map((header, idx) => {
                  const dataKey = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const key = dataKey === 'r' ? 'r2' : dataKey === 'times' ? 'time' : dataKey;
                  return (
                    <th 
                      key={idx} 
                      className="p-4 text-sm font-semibold text-slate-300 cursor-pointer group hover:bg-slate-800/50 transition-colors"
                      onClick={() => handleSort(key)}
                    >
                      {header} <SortIcon column={key} />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedComparison.map((row, idx) => (
                <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-medium text-white">{row.model}</td>
                  <td className="p-4 text-slate-400">{row.dataset}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      row.method === 'GA' ? 'bg-emerald-500/10 text-emerald-400' : 
                      row.method === 'PSO' ? 'bg-blue-500/10 text-blue-400' : 
                      'bg-slate-700/50 text-slate-400'
                    }`}>
                      {row.method}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{row.rmse.toFixed(2)}</td>
                  <td className="p-4 text-slate-300">{row.mae.toFixed(2)}</td>
                  <td className="p-4 font-semibold text-white">{row.r2.toFixed(4)}</td>
                  <td className="p-4 text-slate-300">{row.features}</td>
                  <td className="p-4 text-slate-300">{row.time.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
        <Card className="p-8">
          <h3 className="text-center text-lg font-medium text-white mb-8">R² Score Comparison Across Models</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData.comparison} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="model" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis domain={[0.95, 1.0]} stroke="#64748b" tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  cursor={{fill: '#1e293b', opacity: 0.4}}
                />
                <Bar dataKey="r2" name="R² Score" radius={[4, 4, 0, 0]}>
                  {projectData.comparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.method === 'GA' ? '#10b981' : 
                      entry.method === 'PSO' ? '#3b82f6' : '#64748b'
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
            <h3 className="text-emerald-400 font-semibold mb-6 flex items-center gap-2">
              <Network className="w-5 h-5" /> Features GA Selected
            </h3>
            <div className="flex flex-wrap gap-3">
              {[...projectData.features.common, ...projectData.features.ga_only].map(f => (
                <div key={f} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400" /> {f}
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="border-blue-900/30">
            <h3 className="text-blue-400 font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Features PSO Selected
            </h3>
            <div className="flex flex-wrap gap-3">
              {[...projectData.features.common, ...projectData.features.pso_only].map(f => (
                <div key={f} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-200">
                  <Check className="w-4 h-4 text-blue-400" /> {f}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-slate-800/30 border-slate-700/50 border-dashed">
            <h4 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Features Dropped by Both</h4>
            <div className="flex flex-wrap gap-3">
              {projectData.features.dropped.map(f => (
                <div key={f} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full text-sm text-slate-500 line-through">
                  <X className="w-4 h-4 text-rose-500/70" /> {f}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* PREDICTOR SECTION */}
      <Section id="predictor" title="Live Price Predictor">
        <Card className="max-w-4xl mx-auto border-indigo-900/30">
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="w-6 h-6 text-indigo-400" />
            <h3 className="text-2xl font-semibold text-white">XGBoost Inference Engine</h3>
          </div>
          
          <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              
              {/* Image Upload Area */}
              <div className="w-full flex items-center justify-center">
                <label className="w-full h-32 border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5 rounded-xl cursor-pointer flex flex-col items-center justify-center text-slate-400 transition-all overflow-hidden relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Gemstone" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" />
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Gem Image (Optional)</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Carat (Weight/Grams) (Max 10.0)</label>
                <input type="number" step="0.01" max="10.0" min="0.1" name="carat" value={formData.carat} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" required />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cut (1-5)</label>
                  <input type="number" min="1" max="5" name="cut" value={formData.cut} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Color (1-7)</label>
                  <input type="number" min="1" max="7" name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Clarity (1-8)</label>
                  <input type="number" min="1" max="8" name="clarity" value={formData.clarity} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Length X (1-10mm)</label>
                  <input type="number" step="0.01" min="1" max="15" name="x" value={formData.x} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Width Y (1-10mm)</label>
                  <input type="number" step="0.01" min="1" max="15" name="y" value={formData.y} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Depth Z (1-10mm)</label>
                  <input type="number" step="0.01" min="1" max="15" name="z" value={formData.z} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" required />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center p-8 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
              
              {predicting ? (
                <div className="text-indigo-400 animate-pulse flex flex-col items-center gap-4 relative z-10">
                  <Activity className="w-12 h-12" />
                  <span className="text-lg font-medium">Running Inference...</span>
                </div>
              ) : predictedPrice !== null ? (
                <div className="text-center relative z-10">
                  <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Predicted Market Value</div>
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 flex items-center justify-center">
                    <DollarSign className="w-10 h-10 text-emerald-400 mr-1" />
                    {predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-slate-500 text-sm">Powered by Baseline XGBoost Model</p>
                </div>
              ) : (
                <div className="text-center text-slate-500 relative z-10 flex flex-col items-center">
                  {imagePreview ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 mb-4 shadow-xl">
                      <img src={imagePreview} alt="Gem" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  )}
                  <p>Enter gemstone characteristics and run prediction to see the estimated price.</p>
                </div>
              )}
              
              {predictError && (
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center relative z-10 w-full">
                  {predictError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={predicting}
                className="mt-8 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all relative z-10 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {predicting ? 'Processing...' : 'Run Prediction'}
              </button>
            </div>
          </form>
        </Card>
      </Section>

      {/* KEY FINDINGS SECTION */}
      <Section id="findings" title="Key Findings & Conclusions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">{projectData.findings.ga_reduction}</div>
            <div className="text-sm text-slate-400">GA Feature Reduction</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">{projectData.findings.ga_r2_change}</div>
            <div className="text-sm text-slate-400">GA R² Change</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{projectData.findings.pso_reduction}</div>
            <div className="text-sm text-slate-400">PSO Feature Reduction</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{projectData.findings.pso_r2_change}</div>
            <div className="text-sm text-slate-400">PSO R² Change</div>
          </Card>
        </div>
        
        <Card className="p-8 border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400 mt-1">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Hypothesis Supported</h3>
              <p className="text-slate-300 leading-relaxed text-lg mb-4">
                {projectData.findings.summary}
              </p>
              <div className="inline-flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-5 h-5" /> Research Hypothesis Confirmed
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-center text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p className="mb-2">Gemstone Price Prediction Project • IT41033</p>
          <p className="mb-6">Developed by Sajini & Buddhika Janadari • Evaluated by Mr. Sanka Wijewardene</p>
          <div className="flex justify-center items-center gap-4 opacity-50">
            <span>Powered by React</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

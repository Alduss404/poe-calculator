import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, Calculator, TrendingUp } from 'lucide-react';

const LEAGUE = 'Mirage';

export default function App() {
  const [divToChaos, setDivToChaos] = useState(230);
  const [isFetching, setIsFetching] = useState(false);

  const [items, setItems] = useState({
    vivid: { name: 'Vivid (Yellow)', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', amount: 0, cQty: 5000, cPrice: 100, dQty: 9000, dPrice: 1 },
    wild: { name: 'Wild (Purple)', color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10', amount: 0, cQty: 5000, cPrice: 100, dQty: 11000, dPrice: 1 },
    primal: { name: 'Primal (Blue)', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10', amount: 0, cQty: 5000, cPrice: 100, dQty: 10500, dPrice: 1 },
    stackedDeck: { name: 'Stacked Decks', color: 'text-amber-500', border: 'border-amber-500/50', bg: 'bg-amber-500/10', amount: 0, cQty: 85, cPrice: 100, dQty: 200, dPrice: 1 },
  });

  const fetchLivePrices = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/prices?league=${encodeURIComponent(LEAGUE)}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();

      const find = (name) => {
        const entry = data.lines.find((item) => item.currencyTypeName === name);
        if (!entry) throw new Error(`"${name}" not found in API response.`);
        return entry.chaosEquivalent;
      };

      const divineCE = find('Divine Orb');
      setDivToChaos(Math.round(divineCE));

      const lifeforceMap = {
        vivid: 'Vivid Crystallised Lifeforce',
        wild: 'Wild Crystallised Lifeforce',
        primal: 'Primal Crystallised Lifeforce',
        stackedDeck: 'Stacked Deck',
      };

      setItems((prev) => {
        const next = { ...prev };
        for (const [key, apiName] of Object.entries(lifeforceMap)) {
          const ce = find(apiName);
          next[key] = {
            ...prev[key],
            cPrice: 100,
            cQty: Math.round(100 / ce),
            dPrice: 1,
            dQty: Math.round(divineCE / ce),
          };
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to fetch live prices:', err);
      alert(`Could not fetch live prices: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchLivePrices();
  }, []);

  const handleUpdate = (type, field, value) => {
    const numValue = parseFloat(value) || 0;
    setItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: numValue
      }
    }));
  };

  const calculateProfits = (data) => {
    if (!data.cQty || !data.dQty || !divToChaos) return { viaChaos: 0, viaDirect: 0, rawChaos: 0 };

    const rawChaos = (data.amount / data.cQty) * data.cPrice;
    const divViaChaos = rawChaos / divToChaos;
    const divDirect = (data.amount / data.dQty) * data.dPrice;

    return { rawChaos, viaChaos: divViaChaos, viaDirect: divDirect };
  };

  const renderCard = (key) => {
    const data = items[key];
    const { rawChaos, viaChaos, viaDirect } = calculateProfits(data);

    const isChaosBetter = viaChaos > viaDirect;
    const isDirectBetter = viaDirect > viaChaos;
    const diff = Math.abs(viaChaos - viaDirect);
    const diffPercentage = viaDirect === 0 ? 0 : (diff / Math.min(viaChaos, viaDirect)) * 100;

    return (
      <div key={key} className={`rounded-xl border ${data.border} bg-gray-800/50 p-5 shadow-lg flex flex-col`}>
        <div className={`text-xl font-bold mb-4 flex items-center gap-2 ${data.color}`}>
          <div className="w-3 h-3 rounded-full bg-current shadow-[0_0_8px_currentColor]"></div>
          {data.name}
        </div>

        <div className="space-y-4 mb-6 flex-grow">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Stash Amount</label>
            <input
              type="number"
              value={data.amount || ''}
              onChange={(e) => handleUpdate(key, 'amount', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="p-3 bg-gray-900/50 rounded-lg space-y-3 border border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-300">Market Sell Rates</h4>

            <div className="flex items-center gap-2">
              <input type="number" value={data.cQty || ''} onChange={(e) => handleUpdate(key, 'cQty', e.target.value)} className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center" />
              <span className="text-gray-400 text-sm">for</span>
              <input type="number" value={data.cPrice || ''} onChange={(e) => handleUpdate(key, 'cPrice', e.target.value)} className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center text-yellow-500" />
              <span className="text-yellow-500 text-sm font-bold">C</span>
            </div>

            <div className="flex items-center gap-2">
              <input type="number" value={data.dQty || ''} onChange={(e) => handleUpdate(key, 'dQty', e.target.value)} className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center" />
              <span className="text-gray-400 text-sm">for</span>
              <input type="number" value={data.dPrice || ''} onChange={(e) => handleUpdate(key, 'dPrice', e.target.value)} className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center text-white" />
              <span className="text-white text-sm font-bold">D</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isChaosBetter ? 'bg-green-900/20 border-green-700/50' : isDirectBetter ? 'bg-blue-900/20 border-blue-700/50' : 'bg-gray-800 border-gray-700'}`}>
          <div className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Total Yield</div>

          <div className={`flex justify-between items-center mb-2 ${isChaosBetter ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
            <span className="flex items-center gap-1 text-sm"><RefreshCw size={14} /> Via Chaos</span>
            <div className="text-right">
              <div>{viaChaos.toFixed(2)} D</div>
              <div className="text-xs opacity-70">({rawChaos.toFixed(0)} c)</div>
            </div>
          </div>

          <div className={`flex justify-between items-center mb-4 ${isDirectBetter ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
            <span className="flex items-center gap-1 text-sm"><ArrowRight size={14} /> Direct to Div</span>
            <span>{viaDirect.toFixed(2)} D</span>
          </div>

          <div className="pt-3 border-t border-gray-700/50 text-center">
            {diff === 0 ? (
              <span className="text-gray-400 font-medium">Both routes are equal</span>
            ) : isChaosBetter ? (
              <span className="text-green-400 font-medium flex items-center justify-center gap-1">
                <TrendingUp size={16} /> Sell for Chaos (+{diffPercentage.toFixed(1)}%)
              </span>
            ) : (
              <span className="text-blue-400 font-medium flex items-center justify-center gap-1">
                <TrendingUp size={16} /> Sell for Divines (+{diffPercentage.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const totalOptimalDivines = Object.keys(items).reduce((total, key) => {
    const { viaChaos, viaDirect } = calculateProfits(items[key]);
    return total + Math.max(viaChaos, viaDirect);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-yellow-400 to-amber-500 flex items-center gap-3">
              <Calculator className="text-gray-100" />
              Trade Router
            </h1>
            <p className="text-gray-400 mt-2">Find the most profitable way to liquidate your items.</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">Economy</div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">1 D</span>
              <RefreshCw size={16} className="text-gray-500" />
              <input
                type="number"
                value={divToChaos || ''}
                onChange={(e) => setDivToChaos(parseFloat(e.target.value) || 0)}
                className="w-20 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center font-bold text-yellow-500 focus:outline-none focus:border-yellow-500"
              />
              <span className="text-yellow-500 font-bold">C</span>
            </div>
            <button
              onClick={fetchLivePrices}
              disabled={isFetching}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                bg-purple-600 hover:bg-purple-500 text-white
                disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed
                border border-purple-500/50 disabled:border-gray-600/50
                shadow-[0_0_10px_rgba(168,85,247,0.3)] disabled:shadow-none"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Syncing...' : 'Sync Live Prices'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Object.keys(items).map(renderCard)}
        </div>
      </div>
    </div>
  );
}

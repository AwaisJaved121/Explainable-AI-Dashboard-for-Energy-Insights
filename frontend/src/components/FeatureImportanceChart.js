import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

const FeatureImportanceChart = () => {
  const [data, setData] = useState(null);
  const [view, setView] = useState('both'); // 'heating', 'cooling', 'both'

  useEffect(() => {
    // Fetch feature importance from API
    fetch('/feature-importance')
      .then(res => res.json())
      .then(json => {
        if (json.heating && json.cooling) {
          const combined = json.heating.map((h, i) => ({
            feature: h.feature,
            heating: h.importance,
            cooling: json.cooling[i].importance
          }));
          setData(combined);
        }
      })
      .catch(err => console.error('Failed to load feature importance:', err));
  }, []);

  if (!data) {
    return (
      <Card>
        <div className="card-header">
          <h2 className="card-title">Feature Importance</h2>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      </Card>
    );
  }

  // Sort by combined importance
  const sortedData = [...data].sort((a, b) => (b.heating + b.cooling) - (a.heating + a.cooling));
  
  const topFeatures = sortedData.slice(0, 10);

  return (
    <Card>
      <div className="card-header flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <h2 className="card-title">Feature Importance</h2>
          <p className="card-subtitle">Random Forest global feature importance rankings</p>
        </div>
        <div className="flex gap-2">
          {['both', 'heating', 'cooling'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                view === v 
                  ? 'bg-cyan-500 text-gray-900 font-medium' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={topFeatures} 
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              type="number" 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="feature" 
              width={140}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#1e293b', 
                border: '1px solid #334155', 
                borderRadius: '8px' 
              }}
              formatter={(value, name) => [
                value.toFixed(4), 
                name === 'heating' ? 'Heating Load Importance' : 'Cooling Load Importance'
              ]}
            />
            <Legend 
              layout="horizontal" 
              align="center" 
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ paddingTop: '10px' }}
            />
            {view === 'both' && (
              <>
                <Bar 
                  dataKey="heating" 
                  name="Heating Load" 
                  fill="#f97316"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                >
                  {topFeatures.map((_, i) => <Cell key={`heating-${i}`} fill={`hsl(25, 90%, ${50 + i * 3}%)`} />)}
                </Bar>
                <Bar 
                  dataKey="cooling" 
                  name="Cooling Load" 
                  fill="#06b6d4"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                >
                  {topFeatures.map((_, i) => <Cell key={`cooling-${i}`} fill={`hsl(189, 90%, ${50 + i * 3}%)`} />)}
                </Bar>
              </>
            )}
            {view === 'heating' && (
              <Bar 
                dataKey="heating" 
                name="Heating Load" 
                fill="#f97316"
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              >
                {topFeatures.map((_, i) => <Cell key={`heating-${i}`} fill={`hsl(25, 90%, ${50 + i * 3}%)`} />)}
              </Bar>
            )}
            {view === 'cooling' && (
              <Bar 
                dataKey="cooling" 
                name="Cooling Load" 
                fill="#06b6d4"
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              >
                {topFeatures.map((_, i) => <Cell key={`cooling-${i}`} fill={`hsl(189, 90%, ${50 + i * 3}%)`} />)}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Top Features Detail</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {topFeatures.slice(0, 8).map((item, i) => (
            <div key={item.feature} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="w-6 text-center text-xs font-bold text-gray-500">{i + 1}</span>
              <span className="flex-1 text-sm font-medium">{item.feature}</span>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs text-orange-400 font-mono">{item.heating.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-xs text-cyan-400 font-mono">{item.cooling.toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Interpretation</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong>Surface Area</strong> and <strong>Glazing Area</strong> are the dominant drivers for both heating and cooling loads. 
          Buildings with larger envelopes lose/gain more heat, while glazing significantly impacts solar heat gain (cooling) and thermal losses (heating).
          <strong>Relative Compactness</strong> has a negative correlation with energy loads - more compact shapes are more energy efficient.
          <strong>Overall Height</strong> primarily affects heating due to increased wall exposure and stack effect.
        </p>
      </div>
    </Card>
  );
};

export default FeatureImportanceChart;
import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useToast } from '../context/ToastContext';

const OptimizationPanel = () => {
  const [objective, setObjective] = useState('both');
  const [constraints, setConstraints] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective, constraints })
      });
      
      if (!response.ok) throw new Error('Optimization failed');
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: 'Optimization Complete',
        description: `Optimal building configuration found for ${objective} load reduction`,
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Optimization failed to find solution',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConstraint = (feature, min, max) => {
    setConstraints(prev => ({
      ...prev,
      [feature]: [parseFloat(min), parseFloat(max)]
    }));
  };

  const removeConstraint = (feature) => {
    setConstraints(prev => {
      const newConstraints = { ...prev };
      delete newConstraints[feature];
      return newConstraints;
    });
  };

  const constraintsList = [
    { key: 'Relative_Compactness', label: 'Relative Compactness', min: 0.6, max: 1.0 },
    { key: 'Surface_Area', label: 'Surface Area (m²)', min: 250, max: 750 },
    { key: 'Wall_Area', label: 'Wall Area (m²)', min: 150, max: 350 },
    { key: 'Roof_Area', label: 'Roof Area (m²)', min: 50, max: 200 },
    { key: 'Overall_Height', label: 'Overall Height (m)', min: 3.5, max: 7.0 },
    { key: 'Glazing_Area', label: 'Glazing Area Ratio', min: 0, max: 0.4 }
  ];

  return (
    <Card>
      <div className="card-header">
        <h2 className="card-title">Design Optimization</h2>
        <p className="card-subtitle">Find optimal building parameters for energy efficiency</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Optimization Objective</h4>
            <div className="space-y-2">
              {['heating', 'cooling', 'both'].map(obj => (
                <label key={obj} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <input
                    type="radio"
                    name="objective"
                    value={obj}
                    checked={objective === obj}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <span className="text-sm capitalize">{obj}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Constraints</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {constraintsList.map(({ key, label, min, max }) => {
                const constraint = constraints[key];
                return (
                  <div key={key} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      checked={!!constraint}
                      onChange={(e) => e.target.checked 
                        ? updateConstraint(key, min, max) 
                        : removeConstraint(key)}
                      className="w-4 h-4 accent-cyan-500"
                    />
                    <span className="text-sm flex-1">{label}</span>
                    {constraint && (
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          step="any"
                          value={constraint[0]}
                          onChange={(e) => updateConstraint(key, e.target.value, constraint[1])}
                          className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          step="any"
                          value={constraint[1]}
                          onChange={(e) => updateConstraint(key, constraint[0], e.target.value)}
                          className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Presets</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    setConstraints({
                      Glazing_Area: [0, 0.15],
                      Surface_Area: [300, 500]
                    });
                    setObjective('cooling');
                  }}
                >
                  Minimize Cooling Load
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    setConstraints({
                      Relative_Compactness: [0.85, 1.0],
                      Overall_Height: [3.5, 4.5]
                    });
                    setObjective('heating');
                  }}
                >
                  Minimize Heating Load
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    setConstraints({
                      Glazing_Area: [0.1, 0.2],
                      Surface_Area: [400, 600],
                      Relative_Compactness: [0.8, 0.95]
                    });
                    setObjective('both');
                  }}
                >
                  Balanced Efficiency
                </Button>
              </div>
            </div>
            <Button 
              variant="primary" 
              className="w-full"
              onClick={runOptimization} 
              isLoading={loading}
              disabled={loading}
            >
              Run Optimization
            </Button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-800/50 p-6 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-cyan-400 border-b border-cyan-500/30 pb-2">Optimization Results Summary</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Based on your constraints, we found a more efficient building design. 
              <strong> Here is what will happen: </strong> 
              Your Heating Load will reduce by <span className="text-green-400 font-bold">{result.improvement?.heating_reduction_pct || 0}%</span> (down to {result.predicted_heating?.toFixed(1) || 0} kWh/m²/yr) and your Cooling Load will reduce by <span className="text-blue-400 font-bold">{result.improvement?.cooling_reduction_pct || 0}%</span> (down to {result.predicted_cooling?.toFixed(1) || 0} kWh/m²/yr).
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mt-2">
              <strong>To achieve this, you need to set your building parameters to exactly these values: </strong> 
              <br/>
              {Object.entries(result.optimal_features || {}).map(([key, val]) => `${key.replace(/_/g, ' ')} should be ${typeof val === 'number' ? val.toFixed(2) : val}`).join(', ')}.
            </p>
            <p className="text-sm text-gray-400 mt-4 italic border-t border-gray-700 pt-2">
              * The AI calculated these exact numbers to give you the maximum energy savings possible within the limits you provided.
            </p>
          </div>
        )}

        {!result && (
          <div className="bg-gray-800/50 p-6 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Select an objective and constraints above, then click "Run Optimization" to see results.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OptimizationPanel;

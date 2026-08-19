import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import { useToast } from '../context/ToastContext';

const CounterfactualAnalysis = () => {
  const [form, setForm] = useState({
    Relative_Compactness: 0.85,
    Surface_Area: 550,
    Wall_Area: 300,
    Roof_Area: 120,
    Overall_Height: 5.0,
    Orientation: 3,
    Glazing_Area: 0.2,
    Glazing_Distribution: 2
  });
  const [targets, setTargets] = useState({
    target_heating: '',
    target_cooling: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateCounterfactual = async () => {
    setLoading(true);
    try {
      const response = await fetch('/counterfactual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: form,
          target_heating: targets.target_heating ? parseFloat(targets.target_heating) : null,
          target_cooling: targets.target_cooling ? parseFloat(targets.target_cooling) : null,
          max_changes: 3
        })
      });
      
      if (!response.ok) throw new Error('Counterfactual generation failed');
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: 'Counterfactual Generated',
        description: 'What-if analysis completed successfully',
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate counterfactual',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="card-header">
        <h2 className="card-title">Counterfactual Analysis</h2>
        <p className="card-subtitle">What changes would achieve target energy loads?</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Current Building</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Relative Compactness"
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={form.Relative_Compactness}
                onChange={(e) => setForm({...form, Relative_Compactness: parseFloat(e.target.value)})}
              />
              <Input
                label="Surface Area"
                type="number"
                min="200"
                max="800"
                value={form.Surface_Area}
                onChange={(e) => setForm({...form, Surface_Area: parseInt(e.target.value)})}
              />
              <Input
                label="Wall Area"
                type="number"
                min="100"
                max="400"
                value={form.Wall_Area}
                onChange={(e) => setForm({...form, Wall_Area: parseInt(e.target.value)})}
              />
              <Input
                label="Roof Area"
                type="number"
                min="50"
                max="200"
                value={form.Roof_Area}
                onChange={(e) => setForm({...form, Roof_Area: parseInt(e.target.value)})}
              />
              <Input
                label="Overall Height"
                type="number"
                step="0.1"
                min="3.5"
                max="7.0"
                value={form.Overall_Height}
                onChange={(e) => setForm({...form, Overall_Height: parseFloat(e.target.value)})}
              />
              <Input
                label="Glazing Area"
                type="number"
                step="0.01"
                min="0"
                max="0.4"
                value={form.Glazing_Area}
                onChange={(e) => setForm({...form, Glazing_Area: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Target Loads (Optional)</h4>
            <p className="text-xs text-gray-500 mb-4">Leave blank for 10% reduction targets</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Target Heating Load"
                type="number"
                step="0.1"
                placeholder="Auto: 10% reduction"
                value={targets.target_heating}
                onChange={(e) => setTargets({...targets, target_heating: e.target.value})}
              />
              <Input
                label="Target Cooling Load"
                type="number"
                step="0.1"
                placeholder="Auto: 10% reduction"
                value={targets.target_cooling}
                onChange={(e) => setTargets({...targets, target_cooling: e.target.value})}
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={generateCounterfactual} isLoading={loading}>
                Generate Counterfactual
              </Button>
            </div>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-orange-500/30">
                <h4 className="text-sm font-medium text-orange-400 mb-3">Original Prediction</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heating Load</span>
                    <span className="font-semibold">{result.original_prediction.Heating_Load.toFixed(1)} kWh/m²/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cooling Load</span>
                    <span className="font-semibold">{result.original_prediction.Cooling_Load.toFixed(1)} kWh/m²/yr</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-green-500/30">
                <h4 className="text-sm font-medium text-green-400 mb-3">Counterfactual Prediction</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heating Load</span>
                    <span className="font-semibold">{result.target_prediction.Heating_Load.toFixed(1)} kWh/m²/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cooling Load</span>
                    <span className="font-semibold">{result.target_prediction.Cooling_Load.toFixed(1)} kWh/m²/yr</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-300">Required Changes</h4>
                <Badge variant="info">Feasibility: {(result.feasibility_score * 100).toFixed(0)}%</Badge>
              </div>
              <div className="space-y-3">
                {result.changes.map((change, i) => (
                  <div key={i} className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{change.feature}</span>
                      <Badge variant={change.change > 0 ? 'warning' : 'info'}>
                        {change.change > 0 ? 'Increase' : 'Decrease'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Original</p>
                        <p className="font-mono">{change.original}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Counterfactual</p>
                        <p className="font-mono">{change.counterfactual}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Change</p>
                        <p className="font-mono text-green-400">{change.change_pct > 0 ? '+' : ''}{change.change_pct}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!result && (
          <div className="bg-gray-800/50 p-6 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Set building parameters and target loads above, then click "Generate Counterfactual" to see results.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CounterfactualAnalysis;

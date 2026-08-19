import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import { useToast } from '../context/ToastContext';

const AnomalyDetection = () => {
  const [features, setFeatures] = useState({
    Relative_Compactness: 0.85,
    Surface_Area: 550,
    Wall_Area: 300,
    Roof_Area: 120,
    Overall_Height: 5.0,
    Orientation: 3,
    Glazing_Area: 0.2,
    Glazing_Distribution: 2
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const detectAnomaly = async () => {
    setLoading(true);
    try {
      const response = await fetch('/anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });
      
      if (!response.ok) throw new Error('Anomaly detection failed');
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: data.is_anomaly ? 'Anomaly Detected' : 'Normal Operation',
        description: data.is_anomaly 
          ? 'This building configuration shows unusual energy patterns'
          : 'Building energy consumption is within normal range',
        variant: data.is_anomaly ? 'destructive' : 'success'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to run anomaly detection',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="card-header">
        <h2 className="card-title">Anomaly Detection</h2>
        <p className="card-subtitle">Identify unusual energy consumption patterns</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Building Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Relative Compactness"
              type="number"
              step="0.01"
              min="0.5"
              max="1.0"
              value={features.Relative_Compactness}
              onChange={(e) => setFeatures({...features, Relative_Compactness: parseFloat(e.target.value)})}
            />
            <Input
              label="Surface Area (m²)"
              type="number"
              min="200"
              max="800"
              value={features.Surface_Area}
              onChange={(e) => setFeatures({...features, Surface_Area: parseInt(e.target.value)})}
            />
            <Input
              label="Wall Area (m²)"
              type="number"
              min="100"
              max="400"
              value={features.Wall_Area}
              onChange={(e) => setFeatures({...features, Wall_Area: parseInt(e.target.value)})}
            />
            <Input
              label="Roof Area (m²)"
              type="number"
              min="50"
              max="200"
              value={features.Roof_Area}
              onChange={(e) => setFeatures({...features, Roof_Area: parseInt(e.target.value)})}
            />
            <Input
              label="Overall Height (m)"
              type="number"
              step="0.1"
              min="3.5"
              max="7.0"
              value={features.Overall_Height}
              onChange={(e) => setFeatures({...features, Overall_Height: parseFloat(e.target.value)})}
            />
            <Input
              label="Glazing Area"
              type="number"
              step="0.01"
              min="0"
              max="0.4"
              value={features.Glazing_Area}
              onChange={(e) => setFeatures({...features, Glazing_Area: parseFloat(e.target.value)})}
            />
            <div>
              <label className="input-label">Orientation</label>
              <select
                value={features.Orientation}
                onChange={(e) => setFeatures({...features, Orientation: parseInt(e.target.value)})}
                className="input"
              >
                <option value={2}>2 (North)</option>
                <option value={3}>3 (East)</option>
                <option value={4}>4 (South)</option>
                <option value={5}>5 (West)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Glazing Distribution</label>
              <select
                value={features.Glazing_Distribution}
                onChange={(e) => setFeatures({...features, Glazing_Distribution: parseInt(e.target.value)})}
                className="input"
              >
                <option value={0}>0 (None)</option>
                <option value={1}>1 (North)</option>
                <option value={2}>2 (East)</option>
                <option value={3}>3 (South)</option>
                <option value={4}>4 (West)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={detectAnomaly} isLoading={loading}>
              Detect Anomaly
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${result.is_anomaly ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.is_anomaly ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    {result.is_anomaly ? (
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{result.is_anomaly ? 'Anomaly Detected' : 'Normal Operation'}</p>
                    <p className="text-sm text-gray-400">Anomaly Score: {result.anomaly_score.toFixed(3)} (threshold: {result.threshold.toFixed(3)})</p>
                  </div>
                </div>
                <Badge variant={result.is_anomaly ? 'danger' : 'success'}>
                  {result.is_anomaly ? 'ANOMALY' : 'NORMAL'}
                </Badge>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Feature Contributions to Anomaly Score</h4>
              <div className="space-y-2">
                {Object.entries(result.feature_contributions || {}).map(([feature, contribution]) => (
                  <div key={feature} className="flex items-center gap-3">
                    <span className="text-sm w-40 text-gray-300">{feature}</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${(contribution * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-cyan-400 w-12">
                      {(contribution * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Interpretation</h4>
              <p className="text-sm text-gray-300">
                {result.is_anomaly 
                  ? 'This building configuration deviates significantly from typical patterns. The features with highest contributions are the primary drivers of this anomaly. Consider reviewing the building design parameters.'
                  : 'This building configuration falls within expected energy consumption patterns. No immediate action required.'}
              </p>
            </div>
          </div>
        )}

        {!result && (
          <div className="bg-gray-800/50 p-8 rounded-lg text-center">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-400">Configure building parameters and run anomaly detection</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnomalyDetection;

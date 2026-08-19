import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useToast } from '../context/ToastContext';
import { usePrediction } from '../context/PredictionContext';
import { useAuth } from '../context/AuthContext';

const ExplanationPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [explanations, setExplanations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [managerView, setManagerView] = useState(false);
  const { toast } = useToast();
  const { currentFeatures, lastPrediction } = usePrediction();
  const { user } = useAuth();

  // Auto-default manager view for manager role
  const isManagerView = user?.role === 'manager' ? true : managerView;

  const fetchExplanations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFeatures)  // always uses latest prediction features
      });
      if (!response.ok) throw new Error('Failed to fetch explanations');
      const data = await response.json();
      setExplanations(data);
      setError(false);
      toast({ title: 'Explanations Generated', description: 'SHAP and LIME explanations loaded', variant: 'success' });
    } catch {
      setError(true);
      toast({ title: 'Error', description: 'Failed to load explanations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderDetailedInsights = () => {
    if (!explanations || !explanations.shap_values) return null;
    const sortedShap = [...explanations.shap_values].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
    if (sortedShap.length < 3) return null;
    const f1 = sortedShap[0];
    const f2 = sortedShap[1];
    const f3 = sortedShap[2];
    
    // Calculate total impact to get percentages
    const totalImpact = sortedShap.reduce((sum, item) => sum + Math.abs(item.shap_value), 0);
    const getPercent = (val) => Math.round((Math.abs(val) / totalImpact) * 100);

    return (
      <div style={{ marginTop: 20, padding: 20, background: 'rgba(59,130,246,0.08)', borderLeft: '4px solid #3b82f6', borderRadius: 8 }}>
        <h4 style={{ color: '#60a5fa', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>🔍 Deep Dive: Comprehensive Energy Audit</h4>
        
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#e2e8f0' }}>
          Our AI has performed a detailed inspection of this specific building's architectural parameters. Rather than just guessing, the model calculated exactly how much each design choice contributes to the final energy bill. Here is the breakdown:
        </p>

        <ul className="text-sm leading-relaxed space-y-3 mb-4" style={{ color: '#cbd5e1', listStyleType: 'disc', paddingLeft: 20 }}>
          <li>
            <strong>Primary Driver — {f1.feature}:</strong> With a value of {f1.feature_value}, this single feature is responsible for <strong>{getPercent(f1.shap_value)}%</strong> of the variance in this building's energy load. Because this value is {f1.shap_value > 0 ? "poorly optimized for efficiency" : "well-optimized"}, it heavily <strong style={{ color: f1.shap_value > 0 ? '#fb923c' : '#4ade80' }}>{f1.shap_value > 0 ? "increases the energy consumption" : "decreases the energy consumption"}</strong> compared to an average building.
          </li>
          <li>
            <strong>Secondary Driver — {f2.feature}:</strong> At {f2.feature_value}, this contributes another <strong>{getPercent(f2.shap_value)}%</strong> to the total impact. Its current design <strong style={{ color: f2.shap_value > 0 ? '#fb923c' : '#4ade80' }}>{f2.shap_value > 0 ? "adds unnecessary thermal load" : "acts as an excellent thermal insulator"}</strong>.
          </li>
          <li>
            <strong>Tertiary Factor — {f3.feature}:</strong> Contributing <strong>{getPercent(f3.shap_value)}%</strong> to the AI's decision, this feature slightly <strong style={{ color: f3.shap_value > 0 ? '#fb923c' : '#4ade80' }}>{f3.shap_value > 0 ? "raises" : "lowers"}</strong> the requirements.
          </li>
        </ul>

        <div className="text-sm leading-relaxed mt-5" style={{ color: '#e2e8f0', background: 'rgba(15, 23, 42, 0.4)', padding: 16, border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 8 }}>
          <strong style={{ color: '#fcd34d' }}>💡 Actionable Strategy for Architects:</strong><br/>
          If your goal is to achieve a greener, more sustainable rating (like LEED certification), you must prioritize redesigning the <strong>{f1.feature.toLowerCase()}</strong> first. 
          <br/><br/>
          <span style={{ color: '#94a3b8' }}>
            {f1.feature.includes("Glazing") ? "Architecture Tip: Consider using double-glazed windows with low-emissivity (Low-E) coatings, adding exterior shading (louvers), or reducing the window-to-wall ratio to block unwanted solar radiation while maintaining natural daylight." 
            : f1.feature.includes("Compactness") || f1.feature.includes("Area") ? "Architecture Tip: Consider altering the floor plan to make the building more compact (closer to a cube shape). A compact shape minimizes the outer surface area exposed to extreme outdoor temperatures, drastically reducing heat loss in winter and heat gain in summer."
            : "Architecture Tip: Adjusting this parameter will yield the highest return on investment for energy savings in this specific design."}
          </span>
        </div>
      </div>
    );
  };

  /* ── Manager simplified summary ── */
  const ManagerSummaryView = () => {
    const topFeatures = explanations?.feature_importance?.slice(0, 4) || [
      { feature: 'Surface Area', importance: 0.28 },
      { feature: 'Overall Height', importance: 0.19 },
      { feature: 'Glazing Area', importance: 0.15 },
      { feature: 'Relative Compactness', importance: 0.12 },
    ];
    return (
      <div className="space-y-4">
        {lastPrediction && (
          <div className="grid grid-2 gap-4">
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>Heating Load</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#fb923c' }}>{lastPrediction.Heating_Load?.toFixed(1)} <span className="text-xs font-normal" style={{ color: '#64748b' }}>kWh/m²/yr</span></p>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>Cooling Load</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#22d3ee' }}>{lastPrediction.Cooling_Load?.toFixed(1)} <span className="text-xs font-normal" style={{ color: '#64748b' }}>kWh/m²/yr</span></p>
            </div>
          </div>
        )}
        <div style={{ padding: 16, borderRadius: 10, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: '#f1f5f9' }}>Key Influencing Factors</h4>
          <div className="space-y-3">
            {topFeatures.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: '#cbd5e1' }}>{item.feature}</span>
                  <span className="text-xs font-medium" style={{ color: '#fb923c' }}>{Math.round(item.importance * 100)}% impact</span>
                </div>
                <div style={{ height: 6, background: 'rgba(17,24,39,0.5)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(item.importance * 100, 100)}%`, background: 'linear-gradient(90deg, #f97316, #ef4444)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: '#f1f5f9' }}>Plain-Language Summary</h4>
          <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
            To estimate how much energy this building will need, the AI looks mostly at the <strong style={{ color: '#f1f5f9' }}>Surface Area</strong> (how exposed it is to the outside) and the <strong style={{ color: '#f1f5f9' }}>Glazing Area</strong> (how many windows it has). 
            <br/><br/>
            Buildings that are more compact (less spread out) lose less heat, making them more energy efficient. On the other hand, having larger windows significantly drives up the need for cooling because of the heat gained from sunlight. If you want to improve efficiency, reducing the window area or making the building shape more compact are the best places to start.
          </p>
          {renderDetailedInsights()}
        </div>
      </div>
    );
  };

  /* ── Engineer technical tabs ── */
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'shap', label: 'SHAP Values' },
    { id: 'lime', label: 'LIME' },
    { id: 'importance', label: 'Feature Importance' },
  ];

  return (
    <Card>
      <div className="card-header">
        <div>
          <h2 className="card-title">Model Explanations</h2>
          <p className="card-subtitle">
            {explanations ? `Explaining: ${Object.entries(currentFeatures).slice(0,2).map(([k,v]) => `${k.replace(/_/g,' ')}=${v}`).join(', ')}…` : 'Understand why the model made these predictions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Role-based view toggle — only shown to engineers */}
          {user?.role !== 'manager' && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#64748b' }}>Manager View</span>
              <label className="switch" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={managerView} onChange={e => setManagerView(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>
          )}
          <Button variant="primary" size="sm" onClick={fetchExplanations} isLoading={loading}>
            {explanations ? 'Refresh' : 'Generate Explanations'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="bg-gray-800/50 p-6 rounded-lg text-center border border-red-500/30">
          <h4 className="text-sm font-medium text-red-400 mb-2">Backend Unavailable</h4>
          <p className="text-sm text-gray-400">
            Explanations could not be loaded. Make sure the backend API is running, then click
            &quot;Generate Explanations&quot; to try again.
          </p>
        </div>
      ) : !explanations ? (
        <div className="bg-gray-800/50 p-6 rounded-lg text-center">
          <p className="text-gray-400 text-sm">
            Click &quot;Generate Explanations&quot; to see why the model made its prediction
            for the latest building configuration.
          </p>
        </div>
      ) : isManagerView ? (
        <ManagerSummaryView />
      ) : (
        <>
          <div className="tabs" role="tablist">
            {tabs.map(t => (
              <button key={t.id} role="tab" aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                className={`tab ${activeTab === t.id ? 'active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="tab-content" role="tabpanel">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Heating Load Drivers', 'Cooling Load Drivers'].map((title, gi) => (
                    <div key={gi} className="bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">{title}</h4>
                      <div className="space-y-3">
                        {(explanations?.feature_importance?.slice(gi * 4, gi * 4 + 4) || [
                          { feature: 'Surface Area', importance: gi === 0 ? 0.28 : 0.22 },
                          { feature: gi === 0 ? 'Overall Height' : 'Glazing Area', importance: gi === 0 ? 0.19 : 0.18 },
                          { feature: gi === 0 ? 'Glazing Area' : 'Relative Compactness', importance: 0.15 },
                          { feature: gi === 0 ? 'Relative Compactness' : 'Overall Height', importance: 0.12 },
                        ]).map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm">{item.feature}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500" style={{ width: `${Math.min((item.importance || 0) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs font-medium text-orange-400">{((item.importance || 0) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Explanation Summary</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    The AI predicts energy needs by looking at the building's physical shape and design. 
                    <strong> Surface Area</strong> (the outer shell of the building) and <strong>Glazing Area</strong> (the amount of glass/windows) are the two biggest factors.
                    <br/><br/>
                    When a building has a higher <strong>Relative Compactness</strong>, it means it has less outer surface area relative to its volume, which prevents heat from escaping. 
                    However, having larger <strong>Glazing Areas</strong> lets in a lot of solar heat, which forces the air conditioning (cooling load) to work much harder.
                  </p>
                  {renderDetailedInsights()}
                </div>
              </div>
            )}

            {activeTab === 'shap' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 leading-relaxed space-y-2">
                  <p>
                    <strong>What is SHAP?</strong> Think of SHAP like an itemized receipt for the AI's decision. It shows exactly how much each feature added or subtracted from the "average" baseline prediction to arrive at this specific result.
                  </p>
                  <p>
                    <span className="text-red-400">Red bars (+)</span> mean the feature increased the predicted energy load. <br/>
                    <span className="text-green-400">Green bars (-)</span> mean the feature helped decrease the energy load.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                  {(explanations?.shap_values?.slice(0, 8) || [
                    { feature: 'Surface Area', shap_value: 12.4, feature_value: 550 },
                    { feature: 'Glazing Area', shap_value: 8.7, feature_value: 0.2 },
                    { feature: 'Overall Height', shap_value: 6.2, feature_value: 5.0 },
                    { feature: 'Relative Compactness', shap_value: -4.2, feature_value: 0.85 },
                    { feature: 'Wall Area', shap_value: 2.8, feature_value: 300 },
                    { feature: 'Roof Area', shap_value: 1.9, feature_value: 120 },
                    { feature: 'Glazing Distribution', shap_value: 3.1, feature_value: 2 },
                    { feature: 'Orientation', shap_value: 0.5, feature_value: 3 },
                  ]).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-40 text-gray-300 truncate">{item.feature}</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full relative overflow-hidden">
                        <div className={`h-full absolute ${(item.shap_value || 0) >= 0 ? 'left-1/2 bg-red-500' : 'right-1/2 bg-green-500'}`}
                          style={{ width: `${Math.min(Math.abs(item.shap_value || 0) / 15 * 50, 50)}%` }} />
                      </div>
                      <span className={`text-sm font-mono w-14 text-right ${(item.shap_value || 0) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(item.shap_value || 0) >= 0 ? '+' : ''}{(item.shap_value || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 w-16 text-right font-mono">{item.feature_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'lime' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 leading-relaxed space-y-2">
                  <p>
                    <strong>What is LIME?</strong> While SHAP looks at the exact math, LIME tries to explain the AI by asking: <em>"What would happen if we tweaked these numbers just a little bit?"</em>
                  </p>
                  <p>
                    LIME builds a simplified, easy-to-understand "local" model just for this specific building to see which parameters are currently pulling the prediction up (red) or pushing it down (green).
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                  {(explanations?.lime_explanation?.slice(0, 8) || [
                    { feature: 'Glazing Area', weight: -0.42 },
                    { feature: 'Surface Area', weight: 0.38 },
                    { feature: 'Relative Compactness', weight: -0.31 },
                    { feature: 'Overall Height', weight: 0.28 },
                    { feature: 'Wall Area', weight: -0.22 },
                    { feature: 'Roof Area', weight: 0.19 },
                    { feature: 'Orientation', weight: 0.15 },
                    { feature: 'Glazing Distribution', weight: -0.12 },
                  ]).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                      <span className="text-sm">{item.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div className={`h-full ${(item.weight || 0) >= 0 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(Math.abs(item.weight || 0) * 2 * 100, 100)}%` }} />
                        </div>
                        <span className={`text-xs font-mono ${(item.weight || 0) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {(item.weight || 0) >= 0 ? '+' : ''}{(item.weight || 0).toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'importance' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 leading-relaxed">
                  <p><strong>The Big Picture (Global Importance)</strong></p>
                  <p className="mt-1">
                    Unlike SHAP and LIME (which explain just <em>this one</em> building), Feature Importance looks at the AI's entire "brain". It shows which features the model relies on the most across <em>all the buildings</em> it has ever seen during its training.
                  </p>
                </div>
                <div className="space-y-3">
                  {(explanations?.feature_importance?.slice(0, 8) || [
                    { feature: 'Surface Area', importance: 0.28 },
                    { feature: 'Glazing Area', importance: 0.19 },
                    { feature: 'Overall Height', importance: 0.15 },
                    { feature: 'Relative Compactness', importance: 0.12 },
                    { feature: 'Glazing Distribution', importance: 0.08 },
                    { feature: 'Wall Area', importance: 0.09 },
                    { feature: 'Roof Area', importance: 0.05 },
                    { feature: 'Orientation', importance: 0.04 },
                  ]).map((item, i) => (
                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.feature}</span>
                        <span className="text-xs text-orange-400 font-mono">{Math.round((item.importance || 0) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${Math.min((item.importance || 0) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default ExplanationPanel;

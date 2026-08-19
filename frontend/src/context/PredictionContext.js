import React, { createContext, useContext, useState } from 'react';

const PredictionContext = createContext(null);

export const PredictionProvider = ({ children }) => {
  const [currentFeatures, setCurrentFeatures] = useState({
    Relative_Compactness: 0.85,
    Surface_Area: 550,
    Wall_Area: 300,
    Roof_Area: 120,
    Overall_Height: 5.0,
    Orientation: 3,
    Glazing_Area: 0.2,
    Glazing_Distribution: 2,
  });
  const [lastPrediction, setLastPrediction] = useState(null);

  return (
    <PredictionContext.Provider value={{ currentFeatures, setCurrentFeatures, lastPrediction, setLastPrediction }}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error('usePrediction must be used within PredictionProvider');
  return ctx;
};

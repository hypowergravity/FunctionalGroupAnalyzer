import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MoleculeInput from './components/MoleculeInput';
import FunctionalGroupResults from './components/FunctionalGroupResults';
import About from './components/About';
import Footer from './components/Footer';
import { analyzeMolecule } from './services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
`;

const Subtitle = styled.p`
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 1.2rem;
  color: #666;
`;

const NavBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
  padding: 10px;
  background: white;
  border-radius: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#f8f9fa'};
  }
`;


function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('analyzer'); // 'analyzer' or 'about'

  const handleMoleculeAnalysis = async (moleculeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeMolecule(moleculeData);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Container>
        <Header>
          <Title>Functional Group Analyzer</Title>
          <Subtitle>
            Identify and analyze functional groups in molecular structures
          </Subtitle>
        </Header>

        <NavBar>
          <NavButton 
            active={currentView === 'analyzer'}
            onClick={() => setCurrentView('analyzer')}
          >
            🧪 Analyzer
          </NavButton>
          <NavButton 
            active={currentView === 'about'}
            onClick={() => setCurrentView('about')}
          >
            📖 About
          </NavButton>
        </NavBar>

        {currentView === 'analyzer' && (
          <>
            <MoleculeInput onAnalyze={handleMoleculeAnalysis} />

            {loading && (
              <LoadingSpinner>
                Analyzing molecule... Please wait.
              </LoadingSpinner>
            )}

            {error && (
              <div style={{ 
                color: 'red', 
                textAlign: 'center', 
                padding: '20px',
                backgroundColor: '#ffe6e6',
                borderRadius: '5px',
                margin: '20px 0'
              }}>
                Error: {error}
              </div>
            )}

            {analysisResult && !loading && (
              <FunctionalGroupResults result={analysisResult} />
            )}
          </>
        )}

        {currentView === 'about' && <About />}
      </Container>
      
      <Footer />
    </div>
  );
}

export default App;
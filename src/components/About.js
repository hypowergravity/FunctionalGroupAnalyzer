import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 40px;
  margin: 30px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AboutHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h2 {
    color: #2c3e50;
    font-size: 2.2rem;
    margin-bottom: 15px;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const MethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin: 40px 0;
`;

const MethodCard = styled.div`
  padding: 25px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
  
  h3 {
    color: #3498db;
    margin-bottom: 15px;
    font-size: 1.3rem;
  }
  
  p {
    color: #495057;
    line-height: 1.6;
    margin-bottom: 10px;
  }
  
  .highlight {
    background: #e3f2fd;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
  }
`;

const TechnicalDetails = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #3498db;
  padding: 25px;
  margin: 30px 0;
  border-radius: 0 8px 8px 0;
  
  h3 {
    color: #2c3e50;
    margin-bottom: 20px;
  }
  
  ul {
    color: #495057;
    line-height: 1.8;
    
    li {
      margin-bottom: 8px;
    }
    
    strong {
      color: #2c3e50;
    }
  }
`;

const ResearchContext = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 10px;
  margin: 30px 0;
  text-align: center;
  
  h3 {
    margin-bottom: 15px;
    font-size: 1.4rem;
  }
  
  p {
    line-height: 1.7;
    opacity: 0.95;
  }
`;

function About() {
  return (
    <AboutContainer>
      <AboutHeader>
        <h2>About Functional Group Analyzer</h2>
        <p>
          Advanced computational platform for automated functional group identification 
          and chemical reaction analysis using state-of-the-art cheminformatics and 
          machine learning methodologies.
        </p>
      </AboutHeader>

      <MethodsGrid>
        <MethodCard>
          <h3>🧬 RXNO Integration</h3>
          <p>
            The <span className="highlight">Reaction Ontology (RXNO)</span> provides 
            standardized reaction classifications and functional group patterns. 
            We extracted comprehensive reaction-specific functional group mappings 
            to understand chemical transformations.
          </p>
          <p>
            This enables the identification of functional groups in the context 
            of their chemical reactivity and transformation pathways.
          </p>
        </MethodCard>

        <MethodCard>
          <h3>🤖 ChemBERT Model</h3>
          <p>
            Leveraging the <span className="highlight">ChemBERT transformer model</span>, 
            we performed automated extraction of functional group information 
            from chemical literature and databases.
          </p>
          <p>
            This natural language processing approach helps capture semantic 
            relationships between functional groups and their chemical properties.
          </p>
        </MethodCard>

        <MethodCard>
          <h3>✅ ChEMBL Validation</h3>
          <p>
            All identified functional groups were validated against the 
            <span className="highlight">ChEMBL bioactivity database</span>, 
            ensuring accuracy and biological relevance.
          </p>
          <p>
            This validation process confirms that detected functional groups 
            are present in known bioactive compounds and drug molecules.
          </p>
        </MethodCard>

        <MethodCard>
          <h3>🔬 RDKit Processing</h3>
          <p>
            Molecular structures are processed using <span className="highlight">RDKit</span> 
            for SMARTS pattern matching, substructure detection, and 
            molecular visualization.
          </p>
          <p>
            Advanced algorithms ensure accurate pattern recognition and 
            generate high-quality molecular visualizations.
          </p>
        </MethodCard>
      </MethodsGrid>

      <TechnicalDetails>
        <h3>Technical Implementation</h3>
        <ul>
          <li><strong>Pattern Recognition:</strong> 850+ curated SMARTS patterns for functional group detection</li>
          <li><strong>Chemical Ontology:</strong> Integration with ChEBI for standardized chemical classifications</li>
          <li><strong>Reaction Context:</strong> RXNO-derived patterns capture reaction-specific functional groups</li>
          <li><strong>Machine Learning:</strong> ChemBERT-enhanced pattern extraction and validation</li>
          <li><strong>Visualization:</strong> Interactive molecular rendering with functional group highlighting</li>
          <li><strong>Database Integration:</strong> Cross-validated with ChEMBL bioactivity data</li>
        </ul>
      </TechnicalDetails>

      <ResearchContext>
        <h3>Research Context</h3>
        <p>
          This application represents cutting-edge research in computational chemistry 
          and cheminformatics, combining traditional chemical informatics approaches 
          with modern machine learning techniques. The goal is to provide researchers 
          and educators with powerful tools for understanding molecular structure-function 
          relationships and chemical reactivity patterns.
        </p>
      </ResearchContext>
    </AboutContainer>
  );
}

export default About;
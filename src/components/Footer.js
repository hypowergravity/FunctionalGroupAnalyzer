import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  margin-top: 60px;
  padding: 40px 20px 20px 20px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const Section = styled.div`
  h3 {
    color: #3498db;
    margin-bottom: 15px;
    font-size: 1.3rem;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 10px;
    color: #ecf0f1;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      margin-bottom: 8px;
      color: #bdc3c7;
      
      &:before {
        content: "•";
        color: #3498db;
        margin-right: 10px;
        font-weight: bold;
      }
    }
  }
`;

const Link = styled.a`
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    color: #5dade2;
    text-decoration: underline;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  color: #bdc3c7;
  font-size: 0.9rem;
`;

const DeveloperSection = styled.div`
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background: rgba(52, 73, 94, 0.5);
  border-radius: 10px;
  
  h4 {
    color: #3498db;
    margin-bottom: 10px;
    font-size: 1.1rem;
  }
  
  p {
    color: #ecf0f1;
    margin: 5px 0;
  }
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <Section>
          <h3>About This Application</h3>
          <p>
            This Functional Group Analyzer was developed to identify and analyze 
            functional groups in molecular structures using advanced cheminformatics 
            and machine learning approaches.
          </p>
          <p>
            The application leverages multiple chemical databases and computational 
            methods to provide comprehensive functional group analysis with 
            visual molecular representations.
          </p>
        </Section>

        <Section>
          <h3>Data Sources & Methods</h3>
          <ul>
            <li>
              <strong>RXNO (Reaction Ontology):</strong> Used for extracting 
              reaction-specific functional group patterns and chemical transformations
            </li>
            <li>
              <strong>ChemBERT Model:</strong> Applied for automated functional 
              group extraction and chemical entity recognition from literature
            </li>
            <li>
              <strong>ChEMBL Database:</strong> Functional groups validated 
              against known bioactive compounds and chemical structures
            </li>
            <li>
              <strong>RDKit:</strong> Chemical informatics library for molecular 
              processing and SMARTS pattern matching
            </li>
            <li>
              <strong>ChEBI (Chemical Entities of Biological Interest):</strong> 
              Ontological classification and chemical entity descriptions
            </li>
          </ul>
        </Section>
      </FooterContent>

      <DeveloperSection>
        <h4>Developer</h4>
        <p><strong>Sriram Srinivasa Raghavan</strong></p>
        <p>Chemical Informatics & Computational Chemistry</p>
        <p>
          This application was developed as part of research in automated 
          functional group analysis and chemical reaction prediction.
        </p>
      </DeveloperSection>

      <Copyright>
        <p>
          © 2025 Functional Group Analyzer. Developed by Sriram Srinivasa Raghavan. 
          Built with React, Flask, and RDKit.
        </p>
        <p>
          For research and educational purposes. Data sources: RXNO, ChEMBL, ChEBI.
        </p>
      </Copyright>
    </FooterContainer>
  );
}

export default Footer;
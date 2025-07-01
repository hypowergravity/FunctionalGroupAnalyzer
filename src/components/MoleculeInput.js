import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const InputSection = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px dashed #ddd;
  border-radius: 5px;
  background: #fafafa;
  cursor: pointer;
  
  &:hover {
    border-color: #667eea;
    background: #f0f0f0;
  }
`;

const AnalyzeButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ExampleButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;

const ExampleButton = styled.button`
  background: #f0f0f0;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
    border-color: #667eea;
  }
`;

const examples = [
  { name: 'Aspirin', smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O' },
  { name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
  { name: 'Ethanol', smiles: 'CCO' },
  { name: 'Benzene', smiles: 'C1=CC=CC=C1' },
  { name: 'Acetic Acid', smiles: 'CC(=O)O' }
];

function MoleculeInput({ onAnalyze }) {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState('smiles');
  const fileInputRef = useRef(null);

  const handleAnalyze = () => {
    if (!inputValue.trim()) {
      alert('Please enter a molecule structure');
      return;
    }

    onAnalyze({
      input: inputValue.trim(),
      type: inputType
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputValue(e.target.result);
        setInputType('mol_file');
      };
      reader.readAsText(file);
    }
  };

  const loadExample = (smiles) => {
    setInputValue(smiles);
    setInputType('smiles');
  };

  return (
    <InputContainer>
      <h2>Enter Molecule Structure</h2>
      
      <InputSection>
        <Label>Input Type:</Label>
        <select 
          value={inputType} 
          onChange={(e) => setInputType(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '5px',
            border: '2px solid #ddd',
            marginBottom: '10px'
          }}
        >
          <option value="smiles">SMILES</option>
          <option value="smarts">SMARTS</option>
          <option value="mol_file">MOL File</option>
        </select>
      </InputSection>

      <InputSection>
        <Label>
          {inputType === 'smiles' && 'SMILES String:'}
          {inputType === 'smarts' && 'SMARTS Pattern:'}
          {inputType === 'mol_file' && 'MOL File Content:'}
        </Label>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            inputType === 'smiles' ? 'Enter SMILES string (e.g., CCO for ethanol)' :
            inputType === 'smarts' ? 'Enter SMARTS pattern' :
            'Paste MOL file content here or upload a file below'
          }
        />
      </InputSection>

      {inputType === 'mol_file' && (
        <InputSection>
          <Label>Or Upload MOL File:</Label>
          <FileInput
            type="file"
            accept=".mol,.sdf"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </InputSection>
      )}

      {inputType === 'smiles' && (
        <InputSection>
          <Label>Example Molecules:</Label>
          <ExampleButtons>
            {examples.map((example, index) => (
              <ExampleButton
                key={index}
                onClick={() => loadExample(example.smiles)}
              >
                {example.name}
              </ExampleButton>
            ))}
          </ExampleButtons>
        </InputSection>
      )}

      <AnalyzeButton 
        onClick={handleAnalyze}
        disabled={!inputValue.trim()}
      >
        Analyze Functional Groups
      </AnalyzeButton>
    </InputContainer>
  );
}

export default MoleculeInput;
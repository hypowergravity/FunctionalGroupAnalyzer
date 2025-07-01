import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const DrawerContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DrawerArea = styled.div`
  border: 2px solid #ddd;
  border-radius: 8px;
  height: 400px;
  width: 100%;
  position: relative;
  background: white;
  cursor: crosshair;
`;

const ToolBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
`;

const ToolButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#f0f0f0'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  &.secondary {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #ddd;
  }
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  border-radius: 6px;
`;

function MoleculeDrawer({ onMoleculeChange, onAnalyze }) {
  const canvasRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('atom');
  const [atoms, setAtoms] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastAtom, setLastAtom] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth * 2; // High DPI
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      drawMolecule();
    }
  }, [atoms, bonds]);

  const drawMolecule = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
    
    // Draw bonds
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    bonds.forEach(bond => {
      const atom1 = atoms[bond.atom1];
      const atom2 = atoms[bond.atom2];
      if (atom1 && atom2) {
        ctx.beginPath();
        ctx.moveTo(atom1.x, atom1.y);
        ctx.lineTo(atom2.x, atom2.y);
        ctx.stroke();
      }
    });
    
    // Draw atoms
    atoms.forEach((atom, index) => {
      // Draw atom circle
      ctx.fillStyle = atom.element === 'C' ? '#333' : 
                     atom.element === 'O' ? '#ff4444' :
                     atom.element === 'N' ? '#4444ff' : '#333';
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw element label
      if (atom.element !== 'C') {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(atom.element, atom.x, atom.y + 4);
      }
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'atom') {
      const newAtom = {
        x,
        y,
        element: 'C', // Default to carbon
        id: atoms.length
      };
      setAtoms([...atoms, newAtom]);
      
      // Auto-bond to nearby atoms
      if (lastAtom && Math.hypot(x - lastAtom.x, y - lastAtom.y) < 50) {
        const newBond = {
          atom1: lastAtom.id,
          atom2: newAtom.id,
          type: 'single'
        };
        setBonds([...bonds, newBond]);
      }
      setLastAtom(newAtom);
    }
  };

  const generateSMILES = () => {
    // Simple SMILES generation for demo
    if (atoms.length === 0) return '';
    
    // This is a simplified SMILES generator
    // In a real app, you'd use a proper chemistry library
    let smiles = '';
    atoms.forEach((atom, index) => {
      if (index > 0) smiles += '-';
      smiles += atom.element;
    });
    
    return smiles || 'CCO'; // Default example
  };

  const clearMolecule = () => {
    setAtoms([]);
    setBonds([]);
    setLastAtom(null);
  };

  const loadExample = (smiles) => {
    // For demo, just pass the SMILES directly
    onMoleculeChange && onMoleculeChange({
      input: smiles,
      type: 'smiles'
    });
  };

  const handleAnalyze = () => {
    const smiles = generateSMILES();
    const moleculeData = {
      input: smiles,
      type: 'smiles'
    };
    
    onMoleculeChange && onMoleculeChange(moleculeData);
    onAnalyze && onAnalyze(moleculeData);
  };

  return (
    <DrawerContainer>
      <h3>Draw Molecule Structure</h3>
      
      <ToolBar>
        <ToolButton 
          active={currentTool === 'atom'}
          onClick={() => setCurrentTool('atom')}
        >
          Add Atom
        </ToolButton>
        <ToolButton 
          active={currentTool === 'bond'}
          onClick={() => setCurrentTool('bond')}
        >
          Add Bond
        </ToolButton>
        <ToolButton onClick={() => loadExample('CCO')}>
          Ethanol
        </ToolButton>
        <ToolButton onClick={() => loadExample('CC(=O)O')}>
          Acetic Acid
        </ToolButton>
        <ToolButton onClick={() => loadExample('CC(=O)OC1=CC=CC=C1C(=O)O')}>
          Aspirin
        </ToolButton>
      </ToolBar>
      
      <DrawerArea>
        <Canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
        />
      </DrawerArea>
      
      <ActionButtons>
        <ActionButton className="primary" onClick={handleAnalyze}>
          Analyze Drawn Molecule
        </ActionButton>
        <ActionButton className="secondary" onClick={clearMolecule}>
          Clear
        </ActionButton>
      </ActionButtons>
      
      <p style={{fontSize: '0.9rem', color: '#666', marginTop: '10px'}}>
        Click to add atoms. Atoms will auto-connect when placed close together.
        Use example buttons for pre-built molecules.
      </p>
    </DrawerContainer>
  );
}

export default MoleculeDrawer;
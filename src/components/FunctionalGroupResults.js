import React, { useState } from 'react';
import styled from 'styled-components';

const ResultsContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MoleculeVisualization = styled.div`
  text-align: center;
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e9ecef;
`;

const MoleculeImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Summary = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #667eea;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
`;

const SummaryText = styled.p`
  margin: 0;
  color: #666;
  font-size: 1.1rem;
`;

const GroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const GroupCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const GroupName = styled.h4`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
`;

const GroupInfo = styled.div`
  margin-bottom: 12px;
`;

const InfoLabel = styled.span`
  font-weight: bold;
  color: #555;
  margin-right: 8px;
`;

const InfoValue = styled.span`
  color: #666;
`;

const CategoryTag = styled.span`
  background: #667eea;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 5px;
  margin-bottom: 5px;
  display: inline-block;
`;

const SmartsPattern = styled.div`
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  margin-top: 10px;
  word-break: break-all;
  border: 1px solid #ddd;
`;

const GroupImage = styled.div`
  text-align: center;
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const GroupImageTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #555;
  font-size: 0.9rem;
`;

const GroupImageImg = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 10px;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const ReactionsList = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
  color: #666;
`;

const ChEBILink = styled.a`
  color: #667eea;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

function FunctionalGroupCard({ group, individualImage }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <GroupCard>
      <GroupName>{group.name}</GroupName>

      {individualImage && (
        <GroupImage>
          <GroupImageTitle>Structure in Molecule</GroupImageTitle>
          <GroupImageImg 
            src={`data:image/png;base64,${individualImage}`}
            alt={`${group.name} highlighted in molecule`}
          />
        </GroupImage>
      )}

      <GroupInfo>
        <InfoLabel>Description:</InfoLabel>
        <InfoValue>{group.description || 'No description available'}</InfoValue>
      </GroupInfo>

      {group.categories && group.categories.length > 0 && (
        <GroupInfo>
          <InfoLabel>Categories:</InfoLabel>
          <div>
            {group.categories.map((category, index) => (
              <CategoryTag key={index}>{category}</CategoryTag>
            ))}
          </div>
        </GroupInfo>
      )}

      {group.subcategories && group.subcategories.length > 0 && (
        <GroupInfo>
          <InfoLabel>Subcategories:</InfoLabel>
          <div>
            {group.subcategories.map((subcategory, index) => (
              <CategoryTag key={index} style={{background: '#764ba2'}}>
                {subcategory}
              </CategoryTag>
            ))}
          </div>
        </GroupInfo>
      )}

      <GroupInfo>
        <InfoLabel>Reactivity:</InfoLabel>
        <InfoValue>{group.reactivity || 'Unknown'}</InfoValue>
      </GroupInfo>

      {group.chebi_id && group.chebi_id !== 'Not available' && (
        <GroupInfo>
          <InfoLabel>ChEBI:</InfoLabel>
          <ChEBILink 
            href={group.chebi_id} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {group.chebi_id.split('/').pop()}
          </ChEBILink>
        </GroupInfo>
      )}

      <ToggleButton onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide Details' : 'Show Details'}
      </ToggleButton>

      {showDetails && (
        <div style={{marginTop: '15px'}}>
          {group.examples && group.examples.length > 0 && (
            <GroupInfo>
              <InfoLabel>Examples:</InfoLabel>
              <InfoValue>{group.examples.join(', ')}</InfoValue>
            </GroupInfo>
          )}

          {group.common_reactions && group.common_reactions.length > 0 && (
            <GroupInfo>
              <InfoLabel>Common Reactions:</InfoLabel>
              <ReactionsList>
                {group.common_reactions.map((reaction, index) => (
                  <li key={index}>{reaction}</li>
                ))}
              </ReactionsList>
            </GroupInfo>
          )}

          {group.chebi_description && group.chebi_description !== 'Not available' && (
            <GroupInfo>
              <InfoLabel>ChEBI Description:</InfoLabel>
              <InfoValue>{group.chebi_description}</InfoValue>
            </GroupInfo>
          )}

          {group.smarts && (
            <div>
              <InfoLabel>SMARTS Pattern:</InfoLabel>
              <SmartsPattern>{group.smarts}</SmartsPattern>
            </div>
          )}

          {group.simplified && (
            <div>
              <InfoLabel>Simplified SMARTS:</InfoLabel>
              <SmartsPattern>{group.simplified}</SmartsPattern>
            </div>
          )}
        </div>
      )}
    </GroupCard>
  );
}

function FunctionalGroupResults({ result }) {
  if (!result || !result.matches) {
    return (
      <ResultsContainer>
        <p>No analysis results available.</p>
      </ResultsContainer>
    );
  }

  const { matches, groups_data, image, individual_images } = result;

  return (
    <ResultsContainer>
      <Summary>
        <SummaryTitle>Analysis Results</SummaryTitle>
        <SummaryText>
          Found {matches.length} functional group{matches.length !== 1 ? 's' : ''} 
          {matches.length > 0 ? ':' : ' in this molecule.'}
        </SummaryText>
      </Summary>

      {image && (
        <MoleculeVisualization>
          <h3 style={{marginTop: 0, color: '#333'}}>Molecular Structure with Highlighted Functional Groups</h3>
          <MoleculeImage 
            src={`data:image/png;base64,${image}`} 
            alt="Molecule with highlighted functional groups"
          />
          <p style={{marginBottom: 0, fontSize: '0.9rem', color: '#666'}}>
            Different colors represent different functional groups
          </p>
        </MoleculeVisualization>
      )}

      {matches.length > 0 && (
        <GroupsGrid>
          {matches.map((groupName, index) => (
            <FunctionalGroupCard 
              key={index}
              group={groups_data[groupName] || { name: groupName }}
              individualImage={individual_images && individual_images[groupName]}
            />
          ))}
        </GroupsGrid>
      )}
    </ResultsContainer>
  );
}

export default FunctionalGroupResults;
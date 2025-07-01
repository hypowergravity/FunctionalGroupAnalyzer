// API service for communicating with Flask backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://functionalgroupanalyzer.onrender.com/api'
  : 'http://localhost:5000/api';

export const analyzeMolecule = async (moleculeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moleculeData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze molecule');
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error analyzing molecule:', error);
    throw new Error('Failed to analyze molecule. Please try again.');
  }
};

export const searchFunctionalGroups = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/${encodeURIComponent(searchTerm)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search functional groups');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching functional groups:', error);
    throw error;
  }
};

export const getAllFunctionalGroups = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/functional-groups`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch functional groups');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching functional groups:', error);
    throw error;
  }
};
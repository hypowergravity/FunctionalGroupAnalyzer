# Functional Group Analyzer Web Application

A web application for analyzing functional groups in molecular structures, built with React frontend and Flask backend.
## Features

- **Molecular Input**: Support for SMILES, SMARTS, and MOL file formats
- **Functional Group Analysis**: Identifies functional groups using SMARTS pattern matching
- **Interactive Interface**: Modern, responsive web interface
- **Real-time Results**: Fast analysis with detailed functional group information
- **ChEBI Integration**: Links to ChEBI database for additional chemical information

## Setup instructions for local deployment.

### Prerequisites

- Node.js (v16 or higher)
- Python 3.9+
- Git
- GitHub account
- Render.com account (free)

### Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hypowergravity/FunctionalGroupAnalyzer.git
   cd functional-group-analyzer
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

### Development

1. **Start the backend server**:
   ```bash
   cd backend
   python app.py
   ```

2. **Start the frontend** (in a separate terminal):
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application.



## Usage

1. **Enter Molecule**: Input your molecule structure using:
   - SMILES notation (e.g., `CCO` for ethanol)
   - SMARTS patterns for substructure queries
   - MOL file content (paste or upload)

2. **Analyze**: Click "Analyze Functional Groups" to process the molecule

3. **View Results**: Browse the identified functional groups with detailed information including:
   - Functional group names and descriptions
   - Chemical categories and classifications
   - Reactivity information
   - ChEBI database links
   - SMARTS patterns

## Technical Architecture

- **Frontend**: React.js with styled-components
- **Backend**: Flask (Python) with RDKit
- **Chemical Analysis**: RDKit for molecular processing
- **Hosting**: Render.com (free tier)
- **Database**: JSON file (functional groups database)

#

## Data Sources

The application uses a comprehensive functional group database (`functional_group_with_chebi_updated.json`) containing:
- 850+ functional group patterns
- SMARTS pattern definitions
- ChEBI database integration
- Chemical categorization
- Reactivity information


## License

This project is licensed under the MIT License.

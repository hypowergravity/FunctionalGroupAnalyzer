from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import tempfile
import json

# Add the current directory to path to import our modules
sys.path.append(os.path.dirname(__file__))

# Import our existing functional catalog
from FunctionalCatalog import FunctionalGroupAnalyzer, find_matches, Molecule

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize the analyzer globally
analyzer = None

def initialize_analyzer():
    global analyzer
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'functional_group_with_chebi_updated.json')
        analyzer = FunctionalGroupAnalyzer(json_path)
        print("✅ Functional Group Analyzer initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing analyzer: {e}")
        analyzer = None

@app.route('/')
def home():
    return jsonify({
        "message": "Functional Group Analyzer API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/api/analyze",
            "health": "/api/health"
        }
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "analyzer_loaded": analyzer is not None
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_molecule():
    try:
        # Get request data
        data = request.json
        molecule_input = data.get('input')
        input_type = data.get('type', 'smiles')
        
        if not molecule_input:
            return jsonify({"error": "No molecule input provided"}), 400
        
        if analyzer is None:
            return jsonify({"error": "Analyzer not initialized"}), 500
        
        # Create molecule object
        if input_type == 'mol_file':
            # For MOL files, write to temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.mol', delete=False) as tmp_file:
                tmp_file.write(molecule_input)
                tmp_file_path = tmp_file.name
            
            try:
                mol_obj = Molecule(tmp_file_path, input_type='mol_file')
            finally:
                os.unlink(tmp_file_path)
        else:
            mol_obj = Molecule(molecule_input, input_type=input_type)
        
        # Find matches
        matches = find_matches(mol_obj.mol, analyzer.get_compiled_patterns())
        
        # Get detailed information for each match
        groups_data = analyzer.get_groups_data()
        
        result = {
            'matches': matches,
            'groups_data': {name: groups_data.get(name, {}) for name in matches},
            'input_type': input_type,
            'success': True,
            'total_matches': len(matches)
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in analyze_molecule: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/functional-groups')
def list_functional_groups():
    """Get list of all available functional groups"""
    try:
        if analyzer is None:
            return jsonify({"error": "Analyzer not initialized"}), 500
        
        groups = analyzer.list_all_groups()
        categories = analyzer.get_all_categories()
        
        return jsonify({
            "total_groups": len(groups),
            "groups": groups[:50],  # Return first 50 for performance
            "categories": categories
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search/<search_term>')
def search_groups(search_term):
    """Search functional groups by term"""
    try:
        if analyzer is None:
            return jsonify({"error": "Analyzer not initialized"}), 500
        
        matches = analyzer.search_groups(search_term)
        return jsonify({
            "search_term": search_term,
            "matches": matches,
            "total": len(matches)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize analyzer on startup
    initialize_analyzer()
    
    # Get port from environment variable (Render requirement)
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False)
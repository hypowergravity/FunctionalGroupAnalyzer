from rdkit import Chem
from rdkit.Chem import Draw
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Chem import AllChem
import json
import matplotlib.pyplot as plt
from PIL import Image
import io


class Molecule:
    def __init__(self, input_data, input_type='auto', sanitize=False, add_hs=False):
        self.mol = None
        self.input_type = input_type

        if input_type == 'auto':
            input_type = self._detect_input_type(input_data)

        if input_type == 'mol_file':
            self.mol = Chem.MolFromMolFile(input_data, sanitize=sanitize)
        elif input_type == 'smiles':
            self.mol = Chem.MolFromSmiles(input_data, sanitize=sanitize)
        elif input_type == 'smarts':
            self.mol = Chem.MolFromSmarts(input_data)
        else:
            raise ValueError(f"Unsupported input type: {input_type}")

        if self.mol is None:
            raise ValueError(
                f"Could not create molecule from input: {input_data}")

        # CRITICAL FIX: Initialize ring information
        self._initialize_ring_info()

        if add_hs:
            self.mol = Chem.AddHs(self.mol)
            # Re-initialize ring info after adding hydrogens
            self._initialize_ring_info()

        if input_type in ['smiles', 'mol_file']:
            AllChem.Compute2DCoords(self.mol)

    def _initialize_ring_info(self):
        """Initialize ring information to prevent RingInfo errors"""
        if self.mol is not None:
            try:
                Chem.FastFindRings(self.mol)
            except:
                try:
                    # Alternative method if FastFindRings fails
                    self.mol.UpdatePropertyCache(strict=False)
                    Chem.GetSymmSSSR(self.mol)
                except Exception as e:
                    print(f"Warning: Could not initialize ring info: {e}")

    def _detect_input_type(self, input_data):
        if input_data.endswith('.mol') or input_data.endswith('.sdf'):
            return 'mol_file'
        elif '[' in input_data or '#' in input_data or any(c in input_data for c in '!@$%'):
            return 'smarts'
        else:
            return 'smiles'


class FunctionalGroupAnalyzer:
    """Class to manage functional group JSON data and analysis"""

    def __init__(self, json_file="functional_group_with_chebi_updated.json"):
        """Initialize with JSON file path"""
        self.json_file = json_file
        self.raw_data = None
        self.groups_data = None
        self.smarts_library = None
        self.compiled_patterns = None
        self._load_data()

    def _load_data(self):
        """Load and parse the JSON file"""
        try:
            with open(self.json_file, 'r') as f:
                self.raw_data = json.load(f)

            # Extract and process the data
            extracted = self._extract_name_and_smarts(self.raw_data)

            # Create groups_data dictionary
            self.groups_data = {item['name']: item for item in extracted}

            # Create smarts_library dictionary
            smarts_dict = {x["name"]: x["smarts"] for x in extracted}
            self.smarts_library = dict(sorted(smarts_dict.items()))

            # Compile patterns
            self.compiled_patterns = self._compile_patterns(
                self.smarts_library)

        except Exception as e:
            print(f"Error loading functional groups data: {e}")
            raise

    def _extract_name_and_smarts(self, data):
        """Extract name and SMARTS patterns from linearized JSON data"""
        results = []

        # Handle linearized structure
        functional_groups = data.get('functional_groups', [])

        for group in functional_groups:
            name = group.get('name', '')
            smarts = group.get('smarts', '')

            if name and smarts:
                # Create path from categories for backward compatibility
                categories = group.get('categories', [])
                subcategories = group.get('subcategories', [])

                # Build hierarchical path
                path_parts = categories + subcategories + [name]
                current_path = ' > '.join(path_parts)

                results.append({
                    'name': name,
                    'smarts': smarts,
                    'path': current_path,
                    'description': group.get('description', ''),
                    'examples': group.get('examples', []),
                    'chebi_id': group.get('chebi_id', 'Not available'),
                    'chebi_description': group.get('chebi_description', 'Not available'),
                    'id': group.get('id', ''),
                    'categories': group.get('categories', []),
                    'subcategories': group.get('subcategories', []),
                    'reactivity': group.get('reactivity', 'unknown'),
                    'common_reactions': group.get('common_reactions', []),
                    'simplified': group.get('simplified', '')
                })

        return results

    def _compile_patterns(self, smarts_library):
        """Compile SMARTS patterns with proper ring info initialization"""
        compiled_patterns = {}
        failed_patterns = []

        for name, smarts in smarts_library.items():
            try:
                pattern_mol = Chem.MolFromSmarts(smarts)
                if pattern_mol is not None:
                    # CRITICAL FIX: Initialize ring information for SMARTS patterns
                    try:
                        Chem.FastFindRings(pattern_mol)
                    except:
                        try:
                            # Alternative method if FastFindRings fails
                            pattern_mol.UpdatePropertyCache(strict=False)
                            Chem.GetSymmSSSR(pattern_mol)
                        except Exception as e:
                            print(
                                f"Warning: Could not initialize ring info for {name}: {e}")

                    compiled_patterns[name] = pattern_mol
                else:
                    failed_patterns.append((name, smarts))
            except Exception as e:
                failed_patterns.append((name, smarts))
                print(f"Failed to compile pattern: {name} -> {e}")

        if failed_patterns:
            print(f"Failed to compile {len(failed_patterns)} patterns")
            # Optionally show some failed patterns for debugging
            for name, smarts in failed_patterns[:3]:
                print(f"  {name}: {smarts}")
            if len(failed_patterns) > 3:
                print(f"  ... and {len(failed_patterns) - 3} more")

        return compiled_patterns

    def get_groups_data(self):
        """Return the complete groups data dictionary"""
        return self.groups_data

    def get_smarts_library(self):
        """Return the SMARTS library dictionary"""
        return self.smarts_library

    def get_compiled_patterns(self):
        """Return the compiled patterns dictionary"""
        return self.compiled_patterns

    def get_group_info(self, group_name):
        """Get detailed information for a specific functional group"""
        return self.groups_data.get(group_name, {})

    def get_groups_by_category(self, category):
        """Get all functional groups belonging to a specific category"""
        matches = []
        category = category.lower()

        for name, data in self.groups_data.items():
            categories = [cat.lower() for cat in data.get('categories', [])]
            subcategories = [subcat.lower()
                             for subcat in data.get('subcategories', [])]

            if category in categories or category in subcategories:
                matches.append(name)

        return matches

    def get_groups_by_reactivity(self, reactivity):
        """Get all functional groups with a specific reactivity level"""
        matches = []
        reactivity = reactivity.lower()

        for name, data in self.groups_data.items():
            if data.get('reactivity', '').lower() == reactivity:
                matches.append(name)

        return matches

    def get_all_categories(self):
        """Get list of all unique categories"""
        all_categories = set()
        for data in self.groups_data.values():
            all_categories.update(data.get('categories', []))
            all_categories.update(data.get('subcategories', []))
        return sorted(list(all_categories))

    def search_groups(self, search_term):
        """Search for functional groups by name, description, categories, or reactions"""
        matches = []
        search_term = search_term.lower()

        for name, data in self.groups_data.items():
            # Search in name and description
            if (search_term in name.lower() or
                    search_term in data.get('description', '').lower()):
                matches.append(name)
                continue

            # Search in categories
            categories = data.get('categories', [])
            if any(search_term in cat.lower() for cat in categories):
                matches.append(name)
                continue

            # Search in subcategories
            subcategories = data.get('subcategories', [])
            if any(search_term in subcat.lower() for subcat in subcategories):
                matches.append(name)
                continue

            # Search in reactions
            reactions = data.get('common_reactions', [])
            if any(search_term in reaction.lower() for reaction in reactions):
                matches.append(name)
                continue

        return matches

    def list_all_groups(self):
        """Return a list of all functional group names"""
        return list(self.groups_data.keys())


def safe_add_hs(mol):
    """Safely add hydrogens with ring info initialization"""
    if mol is None:
        return None
    try:
        mol_with_h = Chem.AddHs(mol)
        if mol_with_h is not None:
            try:
                Chem.FastFindRings(mol_with_h)
            except:
                mol_with_h.UpdatePropertyCache(strict=False)
                Chem.GetSymmSSSR(mol_with_h)
        return mol_with_h
    except Exception as e:
        print(f"Warning: Could not add hydrogens: {e}")
        return mol


def safe_remove_hs(mol):
    """Safely remove hydrogens with ring info initialization"""
    if mol is None:
        return None
    try:
        mol_no_h = Chem.RemoveHs(mol)
        if mol_no_h is not None:
            try:
                Chem.FastFindRings(mol_no_h)
            except:
                mol_no_h.UpdatePropertyCache(strict=False)
                Chem.GetSymmSSSR(mol_no_h)
        return mol_no_h
    except Exception as e:
        print(f"Warning: Could not remove hydrogens: {e}")
        return mol


def find_matches(target_mol, compiled_patterns, filter_ring_overlaps=True):
    """Find matches with proper error handling and ring overlap prevention"""
    matches_keys = []
    matches_with_atoms = []  # Store matches with their atom indices

    # Create variants with proper ring info initialization
    target_with_h = safe_add_hs(target_mol)
    target_no_h = safe_remove_hs(target_mol)

    for pattern_name, pattern_mol in compiled_patterns.items():
        found_match = False
        match_atoms = None

        try:
            # Try matching against original molecule
            if target_mol.HasSubstructMatch(pattern_mol):
                found_match = True
                match_atoms = target_mol.GetSubstructMatch(pattern_mol)
            # Try with explicit hydrogens
            elif target_with_h and target_with_h.HasSubstructMatch(pattern_mol):
                found_match = True
                match_atoms = target_with_h.GetSubstructMatch(pattern_mol)
            # Try without explicit hydrogens
            elif target_no_h and target_no_h.HasSubstructMatch(pattern_mol):
                found_match = True
                match_atoms = target_no_h.GetSubstructMatch(pattern_mol)
        except Exception as e:
            print(f"Error matching pattern {pattern_name}: {e}")
            continue

        if found_match and match_atoms:
            matches_with_atoms.append((pattern_name, match_atoms))

    if filter_ring_overlaps:
        # Filter out overlapping matches in ring systems
        filtered_matches = filter_ring_subfunctional_overlaps(target_mol, matches_with_atoms)
        matches_keys = [match[0] for match in filtered_matches]
    else:
        matches_keys = [match[0] for match in matches_with_atoms]

    return sorted(matches_keys)


def filter_ring_subfunctional_overlaps(target_mol, matches_with_atoms):
    """
    Filter out subfunctional group overlaps in ring systems.
    
    Args:
        target_mol: The target molecule
        matches_with_atoms: List of (pattern_name, match_atoms) tuples
        
    Returns:
        Filtered list of matches without ring subfunctional overlaps
    """
    if not matches_with_atoms:
        return matches_with_atoms
    
    # Initialize ring information
    try:
        Chem.FastFindRings(target_mol)
        ring_info = target_mol.GetRingInfo()
    except Exception as e:
        print(f"Warning: Could not analyze rings for overlap filtering: {e}")
        return matches_with_atoms
    
    # Group matches by whether they involve ring atoms
    ring_matches = []
    non_ring_matches = []
    
    for pattern_name, match_atoms in matches_with_atoms:
        # Check if any matched atoms are in rings
        atoms_in_rings = []
        atoms_not_in_rings = []
        
        for atom_idx in match_atoms:
            if ring_info.IsAtomInRingOfSize(atom_idx, 3) or \
               ring_info.IsAtomInRingOfSize(atom_idx, 4) or \
               ring_info.IsAtomInRingOfSize(atom_idx, 5) or \
               ring_info.IsAtomInRingOfSize(atom_idx, 6) or \
               ring_info.IsAtomInRingOfSize(atom_idx, 7) or \
               ring_info.IsAtomInRingOfSize(atom_idx, 8):
                atoms_in_rings.append(atom_idx)
            else:
                atoms_not_in_rings.append(atom_idx)
        
        if atoms_in_rings:
            ring_matches.append((pattern_name, match_atoms, atoms_in_rings, atoms_not_in_rings))
        else:
            non_ring_matches.append((pattern_name, match_atoms))
    
    # Filter ring matches for overlaps
    filtered_ring_matches = []
    
    # Sort ring matches by size (larger patterns first to keep more specific matches)
    ring_matches.sort(key=lambda x: len(x[1]), reverse=True)
    
    for i, (pattern_name, match_atoms, ring_atoms, non_ring_atoms) in enumerate(ring_matches):
        is_subpattern = False
        
        # Check if this pattern is a substructure of a larger already-accepted pattern
        for accepted_name, accepted_atoms, accepted_ring_atoms, accepted_non_ring_atoms in filtered_ring_matches:
            # If all ring atoms of current pattern are contained in accepted pattern's ring atoms
            if set(ring_atoms).issubset(set(accepted_ring_atoms)):
                # And the patterns share the same ring system
                if _patterns_share_ring_system(target_mol, ring_atoms, accepted_ring_atoms, ring_info):
                    is_subpattern = True
                    print(f"  Filtering out '{pattern_name}' as it overlaps with '{accepted_name}' in ring system")
                    break
        
        if not is_subpattern:
            filtered_ring_matches.append((pattern_name, match_atoms, ring_atoms, non_ring_atoms))
    
    # Combine filtered ring matches with non-ring matches
    final_matches = []
    
    # Add non-ring matches (no filtering needed)
    for pattern_name, match_atoms in non_ring_matches:
        final_matches.append((pattern_name, match_atoms))
    
    # Add filtered ring matches
    for pattern_name, match_atoms, _, _ in filtered_ring_matches:
        final_matches.append((pattern_name, match_atoms))
    
    return final_matches


def _patterns_share_ring_system(mol, atoms1, atoms2, ring_info):
    """
    Check if two sets of atoms share the same ring system.
    
    Args:
        mol: The molecule
        atoms1: First set of atom indices
        atoms2: Second set of atom indices
        ring_info: Ring information from the molecule
        
    Returns:
        True if the atom sets share a ring system
    """
    # Get all rings that contain atoms from each set
    rings1 = set()
    rings2 = set()
    
    for ring_idx in range(ring_info.NumRings()):
        ring_atoms = set(ring_info.AtomRings()[ring_idx])
        
        if any(atom in ring_atoms for atom in atoms1):
            rings1.add(ring_idx)
        
        if any(atom in ring_atoms for atom in atoms2):
            rings2.add(ring_idx)
    
    # If they share any rings, they're in the same ring system
    return len(rings1.intersection(rings2)) > 0


def generate_colors(num_colors):
    import colorsys
    import random

    if num_colors <= 8:
        base_colors = [
            (1.0, 0.0, 0.0),    # Red
            (0.0, 0.8, 0.0),    # Green
            (0.0, 0.4, 1.0),    # Blue
            (1.0, 0.6, 0.0),    # Orange
            (0.8, 0.0, 0.8),    # Magenta
            (0.0, 0.8, 0.8),    # Cyan
            (0.6, 0.4, 0.0),    # Brown
            (0.5, 0.0, 0.5),    # Purple
        ]
        return base_colors[:num_colors]
    else:
        colors = []
        golden_ratio = 0.618033988749895
        h = random.random()

        for i in range(num_colors):
            h += golden_ratio
            h %= 1
            saturation = 0.7 + (i % 3) * 0.1
            value = 0.8 + (i % 2) * 0.15
            rgb = colorsys.hsv_to_rgb(h, saturation, value)
            colors.append(rgb)
        return colors


def create_atom_mapping(source_mol, display_mol):
    """Create robust mapping between source molecule and display molecule atoms"""
    mapping = {}

    if source_mol.GetNumAtoms() == display_mol.GetNumAtoms():
        for i in range(source_mol.GetNumAtoms()):
            mapping[i] = i
        return mapping

    display_atoms = []
    for i in range(display_mol.GetNumAtoms()):
        atom = display_mol.GetAtomWithIdx(i)
        display_atoms.append((atom.GetSymbol(), atom.GetDegree(), i))

    source_heavy_idx = 0
    for i in range(source_mol.GetNumAtoms()):
        atom = source_mol.GetAtomWithIdx(i)
        if atom.GetSymbol() != 'H':
            if source_heavy_idx < len(display_atoms):
                mapping[i] = source_heavy_idx
                source_heavy_idx += 1

    return mapping


def get_substructure_matches(target_mol, pattern_mol):
    """Get substructure matches with proper error handling"""
    target_with_h = safe_add_hs(target_mol)
    target_no_h = safe_remove_hs(target_mol)

    test_molecules = [
        (target_mol, "original"),
        (target_no_h, "no_h"),
        (target_with_h, "with_h")
    ]

    for mol, mol_type in test_molecules:
        if mol is None:
            continue
        try:
            temp_matches = mol.GetSubstructMatches(pattern_mol)
            if temp_matches:
                return temp_matches, mol
        except Exception as e:
            print(f"Error getting matches for {mol_type}: {e}")
            continue

    return [], None


def visualize_matches(target_mol, compiled_patterns, matches_keys, img_size=(400, 400)):
    """Visualize matches with proper error handling"""
    if not matches_keys:
        print("No matches to visualize")
        return None

    display_mol = safe_remove_hs(target_mol)
    if display_mol is None:
        print("Could not create display molecule")
        return None

    all_highlight_atoms = set()
    all_highlight_bonds = set()
    atom_colors = {}
    bond_colors = {}

    colors = generate_colors(len(matches_keys))

    # print("Highlighting substructures:")
    for i, pattern_name in enumerate(matches_keys):
        pattern_mol = compiled_patterns[pattern_name]
        color = colors[i]

        matches, source_mol = get_substructure_matches(target_mol, pattern_mol)

        if not matches or source_mol is None:
            continue

        atom_mapping = create_atom_mapping(source_mol, display_mol)

        # print(f"  - {pattern_name}: {len(matches)} instance(s)")

        for match in matches:
            matched_display_atoms = []

            for source_atom_idx in match:
                if source_atom_idx in atom_mapping:
                    display_atom_idx = atom_mapping[source_atom_idx]
                    if display_atom_idx < display_mol.GetNumAtoms():
                        matched_display_atoms.append(display_atom_idx)
                        all_highlight_atoms.add(display_atom_idx)

                        if display_atom_idx not in atom_colors:
                            atom_colors[display_atom_idx] = color

            for j, atom1_idx in enumerate(matched_display_atoms):
                for atom2_idx in matched_display_atoms[j+1:]:
                    bond = display_mol.GetBondBetweenAtoms(
                        atom1_idx, atom2_idx)
                    if bond is not None:
                        bond_idx = bond.GetIdx()
                        all_highlight_bonds.add(bond_idx)
                        if bond_idx not in bond_colors:
                            bond_colors[bond_idx] = color

    try:
        drawer = rdMolDraw2D.MolDraw2DCairo(img_size[0], img_size[1])
        drawer.DrawMolecule(display_mol,
                            highlightAtoms=list(all_highlight_atoms),
                            highlightAtomColors=atom_colors,
                            highlightBonds=list(all_highlight_bonds),
                            highlightBondColors=bond_colors)
        drawer.FinishDrawing()

        img_data = drawer.GetDrawingText()
        return Image.open(io.BytesIO(img_data))
    except Exception as e:
        print(f"Error creating visualization: {e}")
        return None


def show_individual_matches(target_mol, compiled_patterns, matches_keys, img_size=(300, 300)):
    """Show individual matches with proper error handling"""
    if not matches_keys:
        print("No matches to show individually")
        return

    display_mol = safe_remove_hs(target_mol)
    if display_mol is None:
        print("Could not create display molecule")
        return

    colors = generate_colors(len(matches_keys))

    cols = min(3, len(matches_keys))
    rows = (len(matches_keys) + cols - 1) // cols

    fig, axes = plt.subplots(rows, cols, figsize=(cols*4, rows*4))

    if rows == 1 and cols == 1:
        axes = [axes]
    elif rows == 1 or cols == 1:
        axes = axes.flatten() if hasattr(axes, 'flatten') else [axes]
    else:
        axes = axes.flatten()

    for i, pattern_name in enumerate(matches_keys):
        pattern_mol = compiled_patterns[pattern_name]
        color = colors[i]

        matches, source_mol = get_substructure_matches(target_mol, pattern_mol)

        if not matches or source_mol is None:
            continue

        atom_mapping = create_atom_mapping(source_mol, display_mol)

        highlight_atoms = set()
        highlight_bonds = set()
        atom_colors = {}
        bond_colors = {}

        for match in matches:
            matched_display_atoms = []

            for source_atom_idx in match:
                if source_atom_idx in atom_mapping:
                    display_atom_idx = atom_mapping[source_atom_idx]
                    if display_atom_idx < display_mol.GetNumAtoms():
                        matched_display_atoms.append(display_atom_idx)
                        highlight_atoms.add(display_atom_idx)
                        atom_colors[display_atom_idx] = color

            for j, atom1_idx in enumerate(matched_display_atoms):
                for atom2_idx in matched_display_atoms[j+1:]:
                    bond = display_mol.GetBondBetweenAtoms(
                        atom1_idx, atom2_idx)
                    if bond is not None:
                        bond_idx = bond.GetIdx()
                        highlight_bonds.add(bond_idx)
                        bond_colors[bond_idx] = color

        try:
            drawer = rdMolDraw2D.MolDraw2DCairo(img_size[0], img_size[1])
            drawer.DrawMolecule(display_mol,
                                highlightAtoms=list(highlight_atoms),
                                highlightAtomColors=atom_colors,
                                highlightBonds=list(highlight_bonds),
                                highlightBondColors=bond_colors)
            drawer.FinishDrawing()

            img_data = drawer.GetDrawingText()
            img = Image.open(io.BytesIO(img_data))

            axes[i].imshow(img)
            axes[i].set_title(
                f"{pattern_name}\n({len(matches)} match(es))", fontsize=10)
            axes[i].axis('off')
        except Exception as e:
            print(f"Error visualizing {pattern_name}: {e}")
            axes[i].axis('off')

    for i in range(len(matches_keys), len(axes)):
        axes[i].axis('off')

    plt.tight_layout()
    plt.show()


def display_detailed_matches(matches_keys, groups_data):
    """Display detailed information about matches including CHEBI data and new fields"""
    print("\n=== Detailed Match Information ===")
    for i, pattern_name in enumerate(matches_keys, 1):
        group_info = groups_data.get(pattern_name, {})
        print(f"\n{i}. {pattern_name} (ID: {group_info.get('id', 'N/A')})")
        print(
            f"   Description: {group_info.get('description', 'Not available')}")

        # Categories information
        categories = group_info.get('categories', [])
        if categories:
            print(f"   Categories: {', '.join(categories)}")

        subcategories = group_info.get('subcategories', [])
        if subcategories:
            print(f"   Subcategories: {', '.join(subcategories)}")

        # Reactivity and reactions
        reactivity = group_info.get('reactivity', 'unknown')
        print(f"   Reactivity: {reactivity}")

        reactions = group_info.get('common_reactions', [])
        if reactions:
            print(f"   Common Reactions: {', '.join(reactions)}")

        # CHEBI information
        print(f"   CHEBI ID: {group_info.get('chebi_id', 'Not available')}")
        print(
            f"   CHEBI Description: {group_info.get('chebi_description', 'Not available')}")

        # Examples
        examples = group_info.get('examples', [])
        if examples:
            print(f"   Examples: {', '.join(examples)}")

        # SMARTS patterns
        smarts = group_info.get('smarts', '')
        if smarts:
            print(f"   SMARTS: {smarts}")

        simplified = group_info.get('simplified', '')
        if simplified:
            print(f"   Simplified SMARTS: {simplified}")


def main(target_input, show_detailed=False, show_visualizations=True, analyzer=None):
    """Main function with enhanced error handling and CHEBI information

    Args:
        target_input: SMILES string, molecule file path, or SMARTS pattern
        show_detailed: Whether to display detailed CHEBI information for matches
        show_visualizations: Whether to show molecular visualizations
        analyzer: Optional FunctionalGroupAnalyzer instance, will create new one if not provided

    Returns:
        matches_keys: list of matched functional group names
    """
    # Create analyzer if not provided
    if analyzer is None:
        json_file = "functional_group_with_chebi_updated_meaningful_names.json"#"functional_group_with_chebi_updated.json"
        try:
            analyzer = FunctionalGroupAnalyzer(json_file)
        except Exception as e:
            print(f"Error loading functional groups data: {e}")
            return

    try:
        mol_obj = Molecule(target_input, input_type='auto')
        target_mol = mol_obj.mol
    except Exception as e:
        print(f"Error creating molecule: {e}")
        return

    try:
        matches_keys = find_matches(
            target_mol, analyzer.get_compiled_patterns())
    except Exception as e:
        print(f"Error finding matches: {e}")
        return

    print(f"Found {len(matches_keys)} matching functional groups:")
    for pattern_name in matches_keys:
        print(f"  - {pattern_name}")

    if matches_keys:
        if show_detailed:
            display_detailed_matches(matches_keys, analyzer.get_groups_data())

        if show_visualizations:
            img = visualize_matches(
                target_mol, analyzer.get_compiled_patterns(), matches_keys)
            if img:
                plt.figure(figsize=(8, 8))
                plt.imshow(img)
                plt.title("Molecule with All Matching Substructures Highlighted")
                plt.axis('off')
                plt.show()

            print("\n=== Individual Pattern Matches ===")
            show_individual_matches(
                target_mol, analyzer.get_compiled_patterns(), matches_keys)
    else:
        print("No substructure matches found")

    return matches_keys


# Convenience functions for notebook usage
def analyze_molecule(input_molecule, detailed=True, visualize=True, analyzer=None):
    """Convenience function for analyzing molecules in notebooks"""
    return main(input_molecule, show_detailed=detailed, show_visualizations=visualize, analyzer=analyzer)


def quick_analysis(input_molecule, analyzer=None):
    """Quick analysis without detailed output - just show matches and visualizations"""
    return main(input_molecule, show_detailed=False, show_visualizations=True, analyzer=analyzer)


def detailed_analysis(input_molecule, analyzer=None):
    """Full detailed analysis with CHEBI information"""
    return main(input_molecule, show_detailed=True, show_visualizations=True, analyzer=analyzer)


def text_only_analysis(input_molecule, analyzer=None):
    """Text-only analysis without visualizations"""
    return main(input_molecule, show_detailed=True, show_visualizations=False, analyzer=analyzer)


def create_analyzer(json_file="functional_group_with_chebi_updated.json"):
    """Create a FunctionalGroupAnalyzer instance"""
    return FunctionalGroupAnalyzer(json_file)


def search_functional_groups(search_term, analyzer=None):
    """Search for functional groups by name or description"""
    if analyzer is None:
        analyzer = FunctionalGroupAnalyzer()
    return analyzer.search_groups(search_term)


def list_all_functional_groups(analyzer=None):
    """List all available functional group names"""
    if analyzer is None:
        analyzer = FunctionalGroupAnalyzer()
    return analyzer.list_all_groups()


def search_by_category(category, analyzer=None):
    """Search for functional groups by category"""
    if analyzer is None:
        analyzer = FunctionalGroupAnalyzer()
    return analyzer.get_groups_by_category(category)


def search_by_reactivity(reactivity, analyzer=None):
    """Search for functional groups by reactivity level"""
    if analyzer is None:
        analyzer = FunctionalGroupAnalyzer()
    return analyzer.get_groups_by_reactivity(reactivity)


def get_all_categories(analyzer=None):
    """Get all available categories"""
    if analyzer is None:
        analyzer = FunctionalGroupAnalyzer()
    return analyzer.get_all_categories()


def add_functional_group(new_group, json_file="functional_group_enhanced.json"):
    """Add a new functional group to the database

    Args:
        new_group (dict): Dictionary containing the new functional group data
                         Required fields: name, smarts, description
                         Optional fields: categories, subcategories, examples, etc.
        json_file (str): Path to the JSON file

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Load existing data
        with open(json_file, 'r') as f:
            data = json.load(f)

        # Generate new ID
        existing_ids = [group.get('id', '')
                        for group in data['functional_groups']]
        max_id = 0
        for id_str in existing_ids:
            if id_str.startswith('fg_'):
                try:
                    num = int(id_str.split('_')[1])
                    max_id = max(max_id, num)
                except:
                    continue

        new_id = f"fg_{max_id + 1:03d}"

        # Ensure required fields
        if 'name' not in new_group or 'smarts' not in new_group:
            print("Error: 'name' and 'smarts' are required fields")
            return False

        # Set default values for optional fields
        complete_group = {
            'id': new_id,
            'name': new_group['name'],
            'smarts': new_group['smarts'],
            'description': new_group.get('description', ''),
            'categories': new_group.get('categories', []),
            'subcategories': new_group.get('subcategories', []),
            'examples': new_group.get('examples', []),
            'chebi_id': new_group.get('chebi_id', 'Not available'),
            'reactivity': new_group.get('reactivity', 'unknown'),
            'common_reactions': new_group.get('common_reactions', [])
        }

        # Add other optional fields if present
        for key in ['simplified', 'alternative', 'chebi_description']:
            if key in new_group:
                complete_group[key] = new_group[key]

        # Add to data
        data['functional_groups'].append(complete_group)
        data['metadata']['total_groups'] = len(data['functional_groups'])

        # Save back to file
        with open(json_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(
            f"Successfully added functional group '{new_group['name']}' with ID {new_id}")
        return True

    except Exception as e:
        print(f"Error adding functional group: {e}")
        return False


def remove_functional_group(group_name, json_file="functional_group_with_chebi_updated.json"):
    """Remove a functional group from the database

    Args:
        group_name (str): Name of the functional group to remove
        json_file (str): Path to the JSON file

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Load existing data
        with open(json_file, 'r') as f:
            data = json.load(f)

        # Find and remove the group
        original_count = len(data['functional_groups'])
        data['functional_groups'] = [
            group for group in data['functional_groups']
            if group.get('name') != group_name
        ]

        if len(data['functional_groups']) == original_count:
            print(f"Functional group '{group_name}' not found")
            return False

        # Update metadata
        data['metadata']['total_groups'] = len(data['functional_groups'])

        # Save back to file
        with open(json_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"Successfully removed functional group '{group_name}'")
        return True

    except Exception as e:
        print(f"Error removing functional group: {e}")
        return False

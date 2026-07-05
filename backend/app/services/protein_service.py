from dataclasses import dataclass

from Bio.SeqUtils.ProtParam import ProteinAnalysis as BioProteinAnalysis

# Ported verbatim from the legacy biology.html AA_TYPE lookup so composition
# percentages stay pixel-identical to the original tool.
AA_TYPE = {
    "A": "hydro", "V": "hydro", "I": "hydro", "L": "hydro", "M": "hydro",
    "F": "hydro", "W": "hydro", "P": "hydro",
    "R": "charged", "H": "charged", "K": "charged", "D": "charged", "E": "charged",
    "S": "polar", "T": "polar", "N": "polar", "Q": "polar", "Y": "polar",
    "C": "polar", "G": "polar",
}

VALID_AMINO_ACIDS = set(AA_TYPE)


@dataclass
class ProteinComposition:
    hydrophobic_pct: float
    charged_pct: float
    polar_pct: float


@dataclass
class ProteinStats:
    sequence: str
    length: int
    molecular_weight: float
    isoelectric_point: float
    extinction_coefficient_reduced: int
    extinction_coefficient_oxidized: int
    instability_index: float
    aromaticity: float
    gravy: float
    composition: ProteinComposition


def normalize_sequence(raw_sequence: str) -> str:
    return raw_sequence.strip().upper()


def validate_sequence(sequence: str, min_length: int = 5) -> None:
    if len(sequence) < min_length:
        raise ValueError(f"Sequence too short (min {min_length} residues)")
    for position, residue in enumerate(sequence, start=1):
        if residue not in VALID_AMINO_ACIDS:
            raise ValueError(f"Invalid amino acid character: '{residue}' at position {position}")


def _composition(sequence: str) -> ProteinComposition:
    counts = {"hydro": 0, "charged": 0, "polar": 0}
    for residue in sequence:
        counts[AA_TYPE[residue]] += 1
    length = len(sequence)
    return ProteinComposition(
        hydrophobic_pct=counts["hydro"] / length * 100,
        charged_pct=counts["charged"] / length * 100,
        polar_pct=counts["polar"] / length * 100,
    )


def analyze_protein(raw_sequence: str) -> ProteinStats:
    sequence = normalize_sequence(raw_sequence)
    validate_sequence(sequence)

    analysis = BioProteinAnalysis(sequence)
    ext_reduced, ext_oxidized = analysis.molar_extinction_coefficient()

    return ProteinStats(
        sequence=sequence,
        length=len(sequence),
        molecular_weight=analysis.molecular_weight(),
        isoelectric_point=analysis.isoelectric_point(),
        extinction_coefficient_reduced=ext_reduced,
        extinction_coefficient_oxidized=ext_oxidized,
        instability_index=analysis.instability_index(),
        aromaticity=analysis.aromaticity(),
        gravy=analysis.gravy(),
        composition=_composition(sequence),
    )

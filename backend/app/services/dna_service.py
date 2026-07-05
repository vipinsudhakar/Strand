from dataclasses import dataclass
from typing import List

from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction, molecular_weight
from Bio.SeqUtils.MeltingTemp import Tm_NN

VALID_BASES = set("ATCG")
MELTING_TEMP_METHOD = "nearest_neighbor"


@dataclass
class DnaStats:
    sequence: str
    length: int
    gc_content: float
    melting_temp: float
    melting_temp_method: str
    molecular_weight: float
    rna: str
    protein: str
    markers: List[str]


def normalize_sequence(raw_sequence: str) -> str:
    return "".join(raw_sequence.split()).upper()


def validate_sequence(sequence: str) -> None:
    if not sequence:
        raise ValueError("Sequence is empty")
    invalid = sorted(set(sequence) - VALID_BASES)
    if invalid:
        raise ValueError("Invalid DNA sequence: only A/T/C/G allowed")


def _translate(seq: Seq) -> str:
    # Legacy JS silently drops a trailing partial codon; truncate to match.
    coding_length = len(seq) - (len(seq) % 3)
    protein = str(seq[:coding_length].translate())
    # Legacy JS uses '_' for stop codons; Biopython emits '*'.
    return protein.replace("*", "_")


def _markers(protein: str) -> List[str]:
    markers = []
    if "M" in protein:
        markers.append("Start Codon (Methionine)")
    if "_" in protein:
        markers.append("Stop Codon (ORF End)")
    return markers


def analyze_dna(raw_sequence: str) -> DnaStats:
    sequence = normalize_sequence(raw_sequence)
    validate_sequence(sequence)

    seq = Seq(sequence)
    protein = _translate(seq)

    return DnaStats(
        sequence=sequence,
        length=len(sequence),
        gc_content=gc_fraction(seq) * 100,
        melting_temp=Tm_NN(seq),
        melting_temp_method=MELTING_TEMP_METHOD,
        molecular_weight=molecular_weight(seq, seq_type="DNA", double_stranded=True),
        rna=str(seq.transcribe()),
        protein=protein,
        markers=_markers(protein),
    )

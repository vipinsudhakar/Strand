import pytest

from app.services.dna_service import analyze_dna

# Human insulin gene — one of the bundled samples.
INSULIN_GENE = (
    "ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCC"
    "TTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTC"
    "TTCTACACACCCAAGACCCGCCGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGGGGCCCT"
    "GGTGCAGGCAGCCTGCAGCCCTTGGCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGT"
    "ACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAACTAG"
)


def test_gc_and_length():
    stats = analyze_dna(INSULIN_GENE)
    assert stats.length == 333
    assert stats.gc_content == pytest.approx(64.56, abs=0.1)


def test_transcription_and_translation():
    stats = analyze_dna(INSULIN_GENE)
    assert stats.rna == INSULIN_GENE.replace("T", "U")
    # Stop codon rendered as '_' to match the legacy UI convention.
    assert stats.protein.startswith("MALWMRLL")
    assert stats.protein.endswith("_")
    assert "*" not in stats.protein


def test_markers_present():
    markers = analyze_dna(INSULIN_GENE).markers
    assert "Start Codon (Methionine)" in markers
    assert "Stop Codon (ORF End)" in markers


def test_method_is_nearest_neighbor():
    assert analyze_dna(INSULIN_GENE).melting_temp_method == "nearest_neighbor"


def test_invalid_base_rejected():
    with pytest.raises(ValueError):
        analyze_dna("ATCGX")

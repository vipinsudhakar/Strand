import pytest

from app.services.protein_service import analyze_protein

# Human insulin preproprotein — one of the bundled samples.
INSULIN = (
    "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGG"
    "PGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN"
)


def test_insulin_core_stats():
    stats = analyze_protein(INSULIN)
    assert stats.length == 110
    # MW should stay close to the legacy hand-rolled number.
    assert stats.molecular_weight == pytest.approx(11980.79, abs=0.5)
    # Reduced extinction coefficient matches the legacy nTrp*5500 + nTyr*1490 formula.
    assert stats.extinction_coefficient_reduced == 16960
    # Real pI is no longer clamped to [4, 10].
    assert stats.isoelectric_point == pytest.approx(5.22, abs=0.1)


def test_composition_sums_to_100():
    c = analyze_protein(INSULIN).composition
    assert c.hydrophobic_pct + c.charged_pct + c.polar_pct == pytest.approx(100.0, abs=0.01)


def test_short_sequence_rejected():
    with pytest.raises(ValueError):
        analyze_protein("MAL")


def test_invalid_character_rejected():
    with pytest.raises(ValueError):
        analyze_protein("MALWMRLLPZ")

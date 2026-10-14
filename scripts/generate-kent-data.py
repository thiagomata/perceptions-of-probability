"""Generate modeled weights from Sherman Kent's proposed probability scale.

Source:
https://www.cia.gov/resources/csi/static/Words-of-Estimative-Probability.pdf

The triangular shape is our assumption, not observed CIA data. Each one-point
bin receives the exact CDF mass between its half-point boundaries. The central
reference value is the mode; Certain and Impossible are point masses.
"""

import csv
from pathlib import Path

# Each entry contains the phrase, lower bound, mode, and upper bound (percent).
SCALE = [
    ("Certain", 100, 100, 100),
    ("Almost certain", 87, 93, 99),
    ("Probable", 63, 75, 87),
    ("Chances about even", 40, 50, 60),
    ("Probably not", 20, 30, 40),
    ("Almost certainly not", 2, 7, 12),
    ("Impossible", 0, 0, 0),
]


def triangular_cdf(value, lower, mode, upper):
    """Return cumulative probability for a non-degenerate triangle."""
    if value <= lower:
        return 0.0
    if value >= upper:
        return 1.0
    if value <= mode:
        return (value - lower) ** 2 / ((upper - lower) * (mode - lower))
    return 1 - (upper - value) ** 2 / ((upper - lower) * (upper - mode))


def generate_dataset(destination):
    """Write percentage weights on a 0–100 grid, including endpoint masses."""
    with destination.open("w", newline="") as output:
        writer = csv.writer(output, lineterminator="\n")
        writer.writerow(["probability"] + [entry[0] for entry in SCALE])

        for value in range(101):
            weights = []
            for _, lower, mode, upper in SCALE:
                if lower == upper:
                    # A degenerate reference range concentrates all mass here.
                    mass = float(value == mode)
                else:
                    # Integrate over the bin instead of sampling its density.
                    right = triangular_cdf(
                        min(100, value + 0.5), lower, mode, upper
                    )
                    left = triangular_cdf(
                        max(0, value - 0.5), lower, mode, upper
                    )
                    mass = right - left
                weights.append(f"{100 * mass:.10f}")

            writer.writerow([value] + weights)


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    generate_dataset(project_root / "data" / "kent-triangular.csv")

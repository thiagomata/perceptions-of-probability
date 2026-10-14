# Perceptions of Probability

**Explore uncertainty behind an estimate.**

A single estimate hides the range of possible outcomes. This interactive experiment combines optimistic and pessimistic estimates with a verbal likelihood—such as “Probable” or “About Even”—to explore a modeled distribution.

[Try the calculator](https://thiagomata.github.io/perceptions-of-probability/calculator.html) · [Survey estimation cards](cards.html) · [Kent model estimation cards](kent-cards.html)

## Why a distribution instead of a single number?

Inspired by [Uncle Bob’s discussion of estimation](https://youtu.be/p0O1VVqRSK0?t=2222), this project explores estimates as distributions rather than single values. The motivation is to communicate uncertainty around an outcome, rather than compress it into one number.

Describing an entire distribution can be cumbersome. This tool explores a simpler approach: provide optimistic and pessimistic estimates, then choose a phrase describing how likely the optimistic estimate feels.

## How it works

1. Choose a reference source.
2. Enter optimistic and pessimistic estimates in the same units.
3. Select a likelihood phrase.
4. Choose the model interval coverage.
5. Explore the expected estimate, interval, and chart.

Higher likelihood assigned to the optimistic estimate shifts the modeled estimates toward the optimistic end of the range.

## Reference sources

### Survey responses

This mode draws on the probability-perception work referenced in [zonination’s Perceptions of Probability and Numbers](https://github.com/zonination/perceptions).

Respondents from Reddit’s r/SampleSize community assigned numerical probabilities to verbal expressions. The survey was inspired by Sherman Kent’s work on communicating uncertainty; it is not the original CIA study.

The calculator maps the phrase-specific weights onto the range between your optimistic and pessimistic estimates.

### Kent scale — triangular model

Sherman Kent’s [Words of Estimative Probability](https://www.cia.gov/resources/csi/static/Words-of-Estimative-Probability.pdf) proposed reference probabilities and approximate ranges for likelihood expressions.

This mode constructs a triangular distribution using the lower reference bound, the central reference probability as the mode, and the upper reference bound.

**The triangular shape is our modeling assumption, not observed CIA data.** “Certain” and “Impossible” are represented as point masses. The original reference scale is available beneath the calculator chart for comparison.

## Understanding the results

- **Expected estimate:** the normalized weighted mean, not necessarily the most likely outcome. The red dot marks this value on the chart.
- **Model-based interval:** equal-tail quantiles at the selected coverage. Because calculations use discrete weights, the interval can contain more probability mass than requested.
- **Chart:** dark bars fall within the selected interval; pale bars fall outside it. The continuous line and shaded area are visual guides; calculations use the discrete weights.

## What the model does—and doesn’t establish

The probability-perception research concerns how people interpret likelihood phrases. Mapping those interpretations onto task estimates is this project’s exploratory modeling choice.

The tool can support conversations about uncertainty and assumptions. It does not establish that actual task outcomes follow the displayed distribution, or that the selected interval has that coverage in practice.

Displayed calculator results are rounded to two decimal places; this precision should not be mistaken for forecasting accuracy.

## Estimation cards

Two separate sets provide lookup tables of rounded expected estimates for selected optimistic and pessimistic values:

- [Survey cards](cards.html): based on the probability-perception survey weights.
- [Kent model cards](kent-cards.html): constructed triangular distributions, with Kent’s reference probabilities and ranges shown on each card. These are modeled weights, not observed CIA data.

Both sets support estimation discussions, including offline meetings. Rows represent pessimistic estimates; columns represent optimistic estimates. Cells contain weighted means rounded to whole numbers. The existing survey cards remain available.

The HTML survey cards contain the corrected calculations. The static [survey PDF](cards.pdf) still needs regeneration; it is not synchronized with these corrections. The Kent cards can be printed from the browser and do not yet have a committed PDF.

## Run locally

From the repository directory:

```sh
python3 -m http.server 8000
```

Open:

- Calculator: `http://localhost:8000/calculator.html`
- Survey cards: `http://localhost:8000/cards.html`
- Kent model cards: `http://localhost:8000/kent-cards.html`

The pages load D3 from a CDN, so an internet connection is required.

## Run the tests

Requires Node.js 18 or newer. No additional packages are needed.

```sh
node --test tests/*.test.cjs
```

Tests cover estimate scaling, bounds, normalization, interval quantiles, invalid inputs, real survey distributions, constructed Kent distributions, and card/calculator consistency.

## Regenerate the Kent dataset

Requires Python 3:

```sh
python3 scripts/generate-kent-data.py
```

The generator writes `data/kent-triangular.csv`, integrating triangular probability mass into one-percentage-point bins.

## Code formatting

HTML and JavaScript use Prettier with the repository configuration:

```sh
npx --yes prettier@3.6.2 --write calculator.html cards.html kent-cards.html js/perceptions.js tests/*.cjs
```

The Python dataset generator uses four-space indentation and documents the
triangular model and bin-integration rules. Comments explain modeling decisions
and non-obvious implementation details.

## References

- [Uncle Bob’s discussion of estimation](https://youtu.be/p0O1VVqRSK0?t=2222)
- [Perceptions of Probability and Numbers — zonination](https://github.com/zonination/perceptions)
- [Words of Estimative Probability — Sherman Kent](https://www.cia.gov/resources/csi/static/Words-of-Estimative-Probability.pdf)

# Calculator numerical regression tests

Run with `node --test tests/calculator.test.cjs` (Node 18 or newer).

These tests load the existing calculation functions directly from calculator.html.
They do not change production code and require no installed packages or browser.
The tests cover the corrected formulas and input validation.

Expected behavior:
- Weighted means use min + normalized position * (max - min).
- Means respect the supplied bounds, including equal bounds and translated ranges.
- Central intervals use equal tails: (1 - coverage)/2 and (1 + coverage)/2.
- Synthetic distributions are normalized discrete probability masses. Interval
  endpoints use the first support value whose cumulative mass reaches the target
  quantile. There is no assumed density between these supplied support points.

The interval tests make the discrete interpretation explicit. If the intended
model instead interpolates within histogram bins, define the bins and their
boundary convention before replacing these expectations; the equal-tail rule
still applies.

getExpectedValue computes a normalized weighted mean, not a mode.

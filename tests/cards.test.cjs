const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");
const context = vm.createContext({});
const source = readFileSync(join(__dirname, "../js/perceptions.js"), "utf8");
vm.runInContext(
  source.slice(0, source.indexOf("// set the dimensions")),
  context,
);
for (const file of ["data.csv", "kent-triangular.csv"]) {
  test(`${file}: every card value matches independently normalized expected estimates`, () => {
    const lines = readFileSync(join(__dirname, "../data", file), "utf8")
      .trim()
      .split(/\r?\n/);
    const cols = lines.shift().split(",");
    const data = lines.map((line) =>
      Object.fromEntries(line.split(",").map((v, i) => [cols[i], v])),
    );
    const values = [1, 2, 3, 5, 8, 13, 20, 30, 50, 100];
    for (const dim of cols.slice(1)) {
      const total = data.reduce((sum, r) => sum + Number(r[dim]), 0);
      const position =
        data.reduce(
          (sum, r) => sum + (1 - Number(r.probability) / 100) * Number(r[dim]),
          0,
        ) / total;
      for (const lo of values)
        for (const hi of values)
          if (lo < hi) {
            const expected = lo + position * (hi - lo);
            const actual = context.getCardExpectedValue(data, dim, lo, hi);
            assert.ok(
              Math.abs(actual - expected) < 1e-8,
              `${dim}: ${lo}..${hi}`,
            );
          }
    }
  });
}
test("the three survey card rounding regressions are corrected", () => {
  const lines = readFileSync(join(__dirname, "../data/data.csv"), "utf8")
    .trim()
    .split(/\r?\n/);
  const cols = lines.shift().split(",");
  const data = lines.map((line) =>
    Object.fromEntries(line.split(",").map((v, i) => [cols[i], v])),
  );
  for (const [dim, lo, hi, expected] of [
    ["We Doubt", 30, 50, 45],
    ["Chances Are Slight", 3, 100, 87],
    ["Highly Unlikely", 13, 50, 47],
  ]) {
    assert.equal(
      Math.round(context.getCardExpectedValue(data, dim, lo, hi)),
      expected,
    );
  }
});

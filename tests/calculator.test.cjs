const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

// Execute the actual pure functions in calculator.html, without D3 or the DOM.
// No production formulas are copied into this test harness.
const source = readFileSync(join(__dirname, '../calculator.html'), 'utf8');
const start = source.indexOf('function extractXY(');
const end = source.indexOf('// Get the data', start);
assert.ok(start >= 0 && end > start, 'Calculator function boundaries exist');
const calculator = vm.createContext({});
vm.runInContext(source.slice(start, end), calculator);

const near = (actual, expected) => assert.ok(
  Math.abs(actual - expected) < 1e-8,
  `Expected ${expected}, received ${actual}`,
);
// x represents position between optimistic (0) and pessimistic (1) bounds.
const distribution = (points) => points.map(([x, mass]) => ({
  probability: String((1 - x) * 100), Example: String(mass * 100),
})).sort((a, b) => Number(a.probability) - Number(b.probability));

test('weighted average on the unit range', () => {
  near(calculator.getExpectedValue(distribution([[0, .25], [1, .75]]), 'Example', 0, 1), .75);
});
test('weighted average scales by the span, not the upper bound', () => {
  near(calculator.getExpectedValue(distribution([[0, .25], [1, .75]]), 'Example', 13, 21), 19);
});
test('a pessimistic point mass stays at the pessimistic bound', () => {
  near(calculator.getExpectedValue(distribution([[1, 1]]), 'Example', 13, 21), 21);
});
test('equal input bounds produce that exact value', () => {
  near(calculator.getExpectedValue(distribution([[.5, 1]]), 'Example', 8, 8), 8);
});
test('shifting both bounds shifts the mean by the same amount', () => {
  const data = distribution([[0, .25], [1, .75]]);
  near(calculator.getExpectedValue(data, 'Example', 23, 31) - calculator.getExpectedValue(data, 'Example', 13, 21), 10);
});
test('a point-mass interval scales to its actual estimate', () => {
  const interval = calculator.getConfidenceInterval(distribution([[.5, 1]]), 'Example', 1, 13, 21);
  near(interval.from, 17);
  near(interval.to, 17);
});
test('95% central interval keeps endpoints with 3% mass in each tail', () => {
  // Discrete equal-tail quantiles: q(.025)=0 and q(.975)=1.
  const interval = calculator.getConfidenceInterval(distribution([[0, .03], [.5, .94], [1, .03]]), 'Example', .95, 0, 1);
  near(interval.from, 0);
  near(interval.to, 1);
});
test('90% central interval excludes endpoints with 3% mass in each tail', () => {
  // Discrete equal-tail quantiles: q(.05)=q(.95)=.5.
  const interval = calculator.getConfidenceInterval(distribution([[0, .03], [.5, .94], [1, .03]]), 'Example', .90, 0, 1);
  near(interval.from, .5);
  near(interval.to, .5);
});

test('rounded percentage weights are normalized', () => {
  near(calculator.getExpectedValue(distribution([[0, .3333], [1, .6666]]), 'Example', 0, 3), 2);
});
test('100% interval includes all positive-weight support', () => {
  const data = distribution([[0, 0], [.2, .5], [.8, .5], [1, 0]]);
  const interval = calculator.getConfidenceInterval(data, 'Example', 1, 0, 10);
  near(interval.from, 2);
  near(interval.to, 8);
});
test('invalid bounds and coverage are rejected', () => {
  const data = distribution([[.5, 1]]);
  assert.throws(() => calculator.getExpectedValue(data, 'Example', 21, 13), /optimistic/);
  for (const coverage of [0, -1, 1.01, NaN]) {
    assert.throws(() => calculator.getConfidenceInterval(data, 'Example', coverage), /Coverage/);
  }
});
test('invalid probability weights are rejected', () => {
  for (const data of [[], distribution([[.5, 0]]), distribution([[.5, -1]]), distribution([[.5, NaN]])]) {
    assert.throws(() => calculator.getExpectedValue(data, 'Example'), /distribution/);
  }
});
test('all real CSV distributions yield bounded means and ordered intervals', () => {
  const lines = readFileSync(join(__dirname, '../data/data.csv'), 'utf8').trim().split(/\r?\n/);
  const columns = lines.shift().split(',');
  const data = lines.map(line => Object.fromEntries(line.split(',').map((v, i) => [columns[i], v])));
  for (const dimension of columns.slice(1)) {
    const mean = calculator.getExpectedValue(data, dimension, 13, 21);
    const interval = calculator.getConfidenceInterval(data, dimension, .95, 13, 21);
    assert.ok(mean >= 13 && mean <= 21, dimension);
    assert.ok(interval.from >= 13 && interval.to <= 21 && interval.from <= interval.to, dimension);
  }
});

test('Kent modeled CSV is normalized and preserves reference means and bounds', () => {
  const lines = readFileSync(join(__dirname, '../data/kent-triangular.csv'), 'utf8').trim().split(/\r?\n/);
  const cols = lines.shift().split(',');
  const data = lines.map(line => Object.fromEntries(line.split(',').map((v,i)=>[cols[i],v])));
  const modes = [100,93,75,50,30,7,0];
  const ranges = [[100,100],[87,99],[63,87],[40,60],[20,40],[2,12],[0,0]];
  cols.slice(1).forEach((dimension,i)=>{
    const total = data.reduce((sum,row)=>sum+Number(row[dimension]),0);
    assert.ok(Math.abs(total-100)<1e-7);
    // All reference triangles are symmetric; reversing probability maps mean to 100-mode.
    near(calculator.getExpectedValue(data,dimension,0,100),100-modes[i]);
    const interval=calculator.getConfidenceInterval(data,dimension,1,0,100);
    near(interval.from,100-ranges[i][1]); near(interval.to,100-ranges[i][0]);
  });
});

"""Build a modeled CSV, not survey observations, from Kent's proposed scale.
Source: https://www.cia.gov/resources/csi/static/Words-of-Estimative-Probability.pdf
Each 1-point bin gets the exact triangular CDF mass over its half-point edges.
The reference probability is the mode. Certain/Impossible are point masses.
"""
import csv
from pathlib import Path
SCALE = [('Certain',100,100,100),('Almost certain',87,93,99),('Probable',63,75,87),('Chances about even',40,50,60),('Probably not',20,30,40),('Almost certainly not',2,7,12),('Impossible',0,0,0)]
def cdf(x, a, m, b):
    if x <= a: return 0.0
    if x >= b: return 1.0
    if x <= m: return (x-a)**2 / ((b-a)*(m-a))
    return 1 - (b-x)**2 / ((b-a)*(b-m))
with (Path(__file__).resolve().parent.parent/'data/kent-triangular.csv').open('w',newline='') as f:
    writer=csv.writer(f)
    writer.writerow(['probability']+[row[0] for row in SCALE])
    for x in range(101):
        weights=[]
        for _,a,m,b in SCALE:
            mass = float(x==m) if a==b else cdf(min(100,x+.5),a,m,b)-cdf(max(0,x-.5),a,m,b)
            weights.append(f'{100*mass:.10f}')
        writer.writerow([x]+weights)

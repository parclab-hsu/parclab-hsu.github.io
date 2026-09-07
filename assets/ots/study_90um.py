"""90 um feasibility extension. Run beside simulate_ots.py; synthetic OTS only."""
import csv
import json
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from simulate_ots import simulate, SEED, N

out=Path(__file__).resolve().parent
candidate=dict(z=3000,focal=16,baseline=600,frames=60,scale=1.5,tcp=150)
cases=[('previous_base',{}),('larger_marker_only',dict(scale=1.5)),
       ('candidate_3m',candidate),('candidate_2_5m',dict(candidate,z=2500)),
       ('candidate_2m_fov',dict(candidate,z=2000)),
       ('candidate_correlated',dict(candidate,frame_correlation=.1)),
       ('candidate_small_bias',dict(candidate,disparity_bias=-.005,baseline_ppm=10)),
       ('candidate_combined_stress',dict(candidate,disparity_bias=-.005,baseline_ppm=10,frame_correlation=.1)),
       ('candidate_previous_bias',dict(candidate,disparity_bias=-.03,baseline_ppm=50)),
       ('candidate_four_markers',dict(candidate,visible=4))]
results=[simulate(name,**args) for name,args in cases]
for r in results:
    r['sample_max_below_90um']=r.get('tcp_sample_max_mm',float('inf'))<=.09
# Correlation=1 means averaging gives no random-noise benefit.
a=simulate('a',frames=1);b=simulate('b',frames=60,frame_correlation=1)
assert abs(a['tcp_p95_mm']-b['tcp_p95_mm'])<1e-12
metadata=dict(seed=SEED,trials_per_case=N,target_mm=.09,
              note='Finite-sample synthetic errors, not guaranteed maximum or robot arrival accuracy',
              correlation_check='rho=1 equals single-frame result',results=results)
(out/'results-90um.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
with (out/'results-90um.csv').open('w',newline='',encoding='utf-8') as h:
    w=csv.DictWriter(h,fieldnames=list(results[0]));w.writeheader();w.writerows(results)
fig,ax=plt.subplots(figsize=(11,6),layout='constrained')
y=np.arange(len(results));p95=[r['tcp_p95_mm']*1000 for r in results];maximum=[r['tcp_sample_max_mm']*1000 for r in results]
ax.barh(y-.18,p95,height=.35,label='P95');ax.barh(y+.18,maximum,height=.35,label='Sample max (not guaranteed max)')
ax.set_yticks(y,[r['case'] for r in results]);ax.invert_yaxis();ax.axvline(90,color='#b03a2e',ls='--',label='90 um design reference')
ax.set(xlabel='Synthetic TCP error (um)',title='90 um feasibility / 3,000 trials per case');ax.legend();ax.grid(axis='x',alpha=.2)
fig.savefig(out/'study-90um.png',dpi=160);plt.close(fig)
for r in results:
    print(r['case'],round(r['tcp_p95_mm']*1000,1),round(r['tcp_sample_max_mm']*1000,1),r['valid'])

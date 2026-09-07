"""OTS design study: synthetic geometry, NOT measured robot accuracy.
Run: python simulate_ots.py --out results
Dependencies: numpy==2.3.5 scipy==1.16.3 matplotlib (see results.json).
All lengths in mm. Camera axes parallel, origin at baseline midpoint.
"""
import argparse
import csv
import json
from pathlib import Path
import numpy as np
import scipy
from scipy.spatial.transform import Rotation
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

SEED = 20260907
N = 3000
# Non-coplanar, asymmetric constellation; recentered at its centroid.
MARKERS = np.array([[-100,-65,0],[90,-70,12],[110,55,-10],[-85,75,18],[0,-20,55],[25,35,-35]],float)
MARKERS -= MARKERS.mean(axis=0)

def fit_pose(model, measured):
    center = measured.mean(axis=1)
    mc = model.mean(axis=0)
    h = np.einsum('mi,nmj->nij', model-mc, measured-center[:,None,:])
    u, _, vt = np.linalg.svd(h)
    v = vt.transpose(0,2,1)
    d = np.ones((len(measured),3)); d[:,2] = np.linalg.det(v @ u.transpose(0,2,1))
    rot = (v*d[:,None,:]) @ u.transpose(0,2,1)
    trans = center - np.einsum('nij,j->ni',rot,mc)
    return rot, trans

def simulate(name, z=3000, focal=12, baseline=600, frames=30,
             sigma=.03, scale=1., tcp=300., visible=6,
             disparity_bias=0., baseline_ppm=0., frame_correlation=0.):
    # Same random poses/noise for controlled comparisons.
    rng=np.random.default_rng(SEED)
    rot=Rotation.from_euler('xyz',rng.uniform(-30,30,(N,3)),degrees=True).as_matrix()
    trans=np.column_stack((rng.uniform(-100,100,N),rng.uniform(-100,100,N),np.full(N,z)))
    model=MARKERS*scale
    points=np.einsum('nij,mj->nmi',rot,model)+trans[:,None,:]
    f=focal/.00345
    left=np.stack((f*(points[:,:,0]+baseline/2)/points[:,:,2],f*points[:,:,1]/points[:,:,2]),axis=-1)
    right=np.stack((f*(points[:,:,0]-baseline/2)/points[:,:,2],f*points[:,:,1]/points[:,:,2]),axis=-1)
    # Field-of-view gate before noise. 10 pixel margin for marker blobs.
    inside=(np.abs(left[:,:,0])<1214)&(np.abs(right[:,:,0])<1214)&(np.abs(left[:,:,1])<1014)&(np.abs(right[:,:,1])<1014)
    # Equicorrelated frame-noise average; rho=0 reproduces the original study.
    assert 0 <= frame_correlation <= 1 and frames >= 1
    mean_sigma=sigma*np.sqrt(frame_correlation+(1-frame_correlation)/frames)
    left += rng.normal(0,mean_sigma,left.shape)
    right += rng.normal(0,mean_sigma,right.shape)
    left[:,:,0] += disparity_bias/2
    right[:,:,0] -= disparity_bias/2
    zz=f*baseline*(1+baseline_ppm*1e-6)/(left[:,:,0]-right[:,:,0])
    measured=np.stack(((left[:,:,0]+right[:,:,0])*zz/(2*f),(left[:,:,1]+right[:,:,1])*zz/(2*f),zz),axis=-1)
    # Prescribed marker deletion models missing observations, not physical ray occlusion.
    ids=np.arange(visible)
    good=inside[:,ids].all(axis=1) if visible>=4 else np.zeros(N,dtype=bool)
    result=dict(case=name,z_mm=z,focal_mm=focal,baseline_mm=baseline,frames=frames,
                sigma_px=sigma,marker_scale=scale,tcp_offset_mm=tcp,visible_markers=visible,
                disparity_bias_px=disparity_bias,baseline_error_ppm=baseline_ppm,
                frame_correlation=frame_correlation,
                trials=N,valid=int(good.sum()),valid_percent=float(good.mean()*100))
    if not good.any(): return result
    rr,tt=fit_pose(model[ids],measured[good][:,ids])
    delta=rr @ rot[good].transpose(0,2,1)
    angle=np.degrees(np.arccos(np.clip((np.trace(delta,axis1=1,axis2=2)-1)/2,-1,1)))
    tip=np.array([0,0,tcp])
    e=np.linalg.norm(np.einsum('nij,j->ni',rr-rot[good],tip)+tt-trans[good],axis=1)
    origin=np.linalg.norm(tt-trans[good],axis=1)
    result.update(tcp_rms_mm=float(np.sqrt(np.mean(e**2))),tcp_p95_mm=float(np.percentile(e,95)),
                  tcp_sample_max_mm=float(e.max()),origin_p95_mm=float(np.percentile(origin,95)),
                  angle_p95_deg=float(np.percentile(angle,95)))
    return result

def main(out):
    out.mkdir(parents=True,exist_ok=True)
    # Meaningful numerical checks: noiseless recovery and scalar analytic propagation.
    zero=simulate('zero',sigma=0)
    assert zero['tcp_sample_max_mm']<1e-7
    assert zero['angle_p95_deg']<1e-5
    rng=np.random.default_rng(SEED); f=12/.00345; z=3000.; b=600.
    disparity=f*b/z+rng.normal(0,np.sqrt(2)*.03,200000)
    empirical=np.std(f*b/disparity-z)
    analytic=z*z/(f*b)*np.sqrt(2)*.03
    assert abs(empirical/analytic-1)<.01
    scenarios=[('near_2m',dict(z=2000)),('base_3m',{}),('far_4m',dict(z=4000)),
       ('single_frame',dict(frames=1)),('noisy_centroid',dict(sigma=.1)),
       ('short_baseline',dict(baseline=400)),('lens_16mm',dict(focal=16)),
       ('small_marker',dict(scale=.5)),('large_marker',dict(scale=1.5)),
       ('long_tool',dict(tcp=600)),('four_markers',dict(visible=4)),
       ('three_markers_rejected',dict(visible=3)),
       ('disparity_bias',dict(disparity_bias=.03)),('baseline_bias',dict(baseline_ppm=50))]
    results=[simulate(name,**kw) for name,kw in scenarios]
    (out/'results.json').write_text(json.dumps(dict(seed=SEED,trials_per_case=N,
      versions=dict(numpy=np.__version__,scipy=scipy.__version__,matplotlib=matplotlib.__version__),
      markers_mm=MARKERS.tolist(),checks=dict(noiseless_tcp_max_mm=zero['tcp_sample_max_mm'],
      analytic_depth_sigma_mm=analytic,empirical_depth_sigma_mm=empirical),results=results),indent=2),encoding='utf-8')
    fields=list(dict.fromkeys(k for r in results for k in r))
    with (out/'results.csv').open('w',newline='',encoding='utf-8') as h:
        w=csv.DictWriter(h,fieldnames=fields);w.writeheader();w.writerows(results)
    plt.rcParams.update({'font.size':10,'axes.spines.top':False,'axes.spines.right':False})
    fig,axes=plt.subplots(1,2,figsize=(12,4.5),layout='constrained')
    distances=np.linspace(1500,4000,150)
    for lens,base in [(12,400),(12,600),(16,600)]:
        sig=distances**2/(lens/.00345*base)*np.sqrt(2)*.03
        axes[0].plot(distances/1000,sig,label=f'{lens} mm lens / {base} mm baseline')
        axes[1].plot(distances/1000,np.maximum(0,2448*.00345/lens*distances-base)/1000,label=f'{lens} / {base}')
    axes[0].set(xlabel='Distance (m)',ylabel='Single-point depth sigma (mm)',title='Independent 0.03 px noise / single frame')
    axes[1].set(xlabel='Distance (m)',ylabel='Horizontal common FOV (m)',title='Parallel cameras / same depth plane')
    for a in axes:a.grid(alpha=.2);a.legend(fontsize=8)
    fig.savefig(out/'geometry.png',dpi=160);plt.close(fig)
    valid=[r for r in results if r['valid']]
    fig,ax=plt.subplots(figsize=(10,5.5),layout='constrained')
    ax.barh([r['case'] for r in valid],[r['tcp_p95_mm'] for r in valid],color='#087f8c')
    ax.axvline(.09,color='#c56a12',linestyle='--',label='90 um design reference (metric to be agreed)')
    ax.set(xlabel='TCP position error P95 (mm)',title='Synthetic OTS errors only / 3,000 trials per case');ax.invert_yaxis();ax.legend();ax.grid(axis='x',alpha=.2)
    fig.savefig(out/'tcp-sensitivity.png',dpi=160);plt.close(fig)
    fig=plt.figure(figsize=(7,5),layout='constrained');ax=fig.add_subplot(111,projection='3d')
    ax.scatter(*MARKERS.T,s=65,color='#087f8c')
    for i,p in enumerate(MARKERS):ax.text(*p,f' M{i+1}')
    ax.plot([0,0],[0,0],[0,300],'--',color='#c56a12');ax.scatter([0],[0],[300],marker='x',s=90,color='#c56a12')
    ax.set(xlabel='X (mm)',ylabel='Y (mm)',zlabel='Z (mm)',title='6-point asymmetric marker / TCP offset 300 mm')
    fig.savefig(out/'marker.png',dpi=160);plt.close(fig)
    print(json.dumps(results,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=Path('results'))
    main(parser.parse_args().out)

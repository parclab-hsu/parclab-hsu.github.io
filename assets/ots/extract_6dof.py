"""Educational 3D correspondences -> TCP 6DoF. Not camera or robot control.
T_A_B maps B coordinates into A coordinates; column vectors, millimetres.
Run without arguments for a synthetic example and numerical checks.
Run --input pose-input.json --output pose-output.json for measured 3D points.
Requires numpy and scipy. Input IDs must already be correctly matched.
"""
import argparse
import json
from pathlib import Path
import warnings
import numpy as np
from scipy.spatial.transform import Rotation

def transform(rpy, xyz):
    t=np.eye(4);t[:3,:3]=Rotation.from_euler('xyz',rpy,degrees=True).as_matrix()
    t[:3,3]=xyz
    return t

def check_transform(t):
    t=np.asarray(t,dtype=float)
    if t.shape!=(4,4) or not np.isfinite(t).all():raise ValueError('Invalid transform shape/values')
    if not np.allclose(t[3],[0,0,0,1]):raise ValueError('Invalid homogeneous row')
    r=t[:3,:3]
    if not np.allclose(r.T@r,np.eye(3),atol=1e-8) or not np.isclose(np.linalg.det(r),1):
        raise ValueError('Transform rotation must be proper orthonormal')
    return t

def extract(data):
    """valid means basic geometry gates passed, NOT a 90 um accuracy certificate."""
    try:
        ids=data['marker_ids']
        a=np.asarray(data['model_points_M_mm'],float)
        b=np.asarray(data['observed_points_C_mm'],float)
        if len(ids)!=len(set(ids)):raise ValueError('Duplicate marker ID')
        if a.ndim!=2 or a.shape[1]!=3 or a.shape!=b.shape or len(a)!=len(ids):
            raise ValueError('Expected matched Nx3 arrays')
        if len(a)<4:raise ValueError('At least 4 observed points required by this demo policy')
        if not np.isfinite(a).all() or not np.isfinite(b).all():raise ValueError('Nonfinite point')
        limit=float(data['max_fit_rms_mm'])
        ratio=float(data['min_shape_ratio'])
        if not np.isfinite(limit) or limit<=0 or not 0<ratio<1:raise ValueError('Invalid quality gates')
        ac=a-a.mean(axis=0);bc=b-b.mean(axis=0)
        # Two independent directions are necessary; do not reject planar points automatically.
        for points in (ac,bc):
            sv=np.linalg.svd(points,compute_uv=False)
            if sv[0]<=0 or sv[1]/sv[0]<ratio:raise ValueError('Collinear or poorly spread points')
        u,_,vt=np.linalg.svd(ac.T@bc)
        d=np.eye(3);d[2,2]=np.linalg.det(vt.T@u.T)
        r=vt.T@d@u.T;t=b.mean(axis=0)-r@a.mean(axis=0)
        residual=np.linalg.norm(a@r.T+t-b,axis=1)
        rms=float(np.sqrt(np.mean(residual**2)))
        if rms>limit:raise ValueError('Rigid fit residual exceeds configured gate')
        tcm=np.eye(4);tcm[:3,:3]=r;tcm[:3,3]=t
        tbt=check_transform(data['T_B_C'])@tcm@check_transform(data['T_M_TCP'])
        rot=Rotation.from_matrix(tbt[:3,:3])
        with warnings.catch_warnings(record=True) as notes:
            warnings.simplefilter('always');rpy=rot.as_euler('xyz',degrees=True)
        return dict(valid=True,accuracy_verified=False,frame_id='robot_base',child_frame_id='tcp',
                    timestamp=data.get('timestamp'),position_mm=tbt[:3,3].tolist(),
                    rpy_deg=rpy.tolist(),rpy_convention='extrinsic xyz: Rz(yaw) @ Ry(pitch) @ Rx(roll)',
                    quaternion_xyzw=rot.as_quat().tolist(),euler_singular=bool(notes),
                    T_C_M=tcm.tolist(),T_B_TCP=tbt.tolist(),fit_rms_mm=rms,visible_markers=len(a))
    except (ValueError,KeyError,TypeError,np.linalg.LinAlgError) as exc:
        return dict(valid=False,accuracy_verified=False,reason=str(exc))

def demo():
    model=np.array([[-100,-65,0],[90,-70,12],[110,55,-10],[-85,75,18],[0,-20,55],[25,35,-35]],float)
    model-=model.mean(axis=0)
    tcm=transform([12,-8,25],[120,-40,2500])
    tbc=transform([0,0,15],[-500,100,0])
    tmt=transform([0,10,0],[0,0,150])
    data=dict(marker_ids=[1,2,3,4,5,6],model_points_M_mm=model.tolist(),
              observed_points_C_mm=(model@tcm[:3,:3].T+tcm[:3,3]).tolist(),
              T_B_C=tbc.tolist(),T_M_TCP=tmt.tolist(),timestamp='synthetic-demo',
              max_fit_rms_mm=.1,min_shape_ratio=.02)
    out=extract(data);expected=tbc@tcm@tmt
    assert out['valid'] and np.allclose(out['T_B_TCP'],expected,atol=1e-9)
    assert np.allclose(Rotation.from_euler('xyz',out['rpy_deg'],degrees=True).as_matrix(),expected[:3,:3])
    assert np.allclose(Rotation.from_quat(out['quaternion_xyzw']).as_matrix(),expected[:3,:3])
    bad=dict(data,marker_ids=[1,1,3,4,5,6]);assert not extract(bad)['valid']
    line=np.column_stack((np.arange(6),np.zeros((6,2)))).tolist()
    assert not extract(dict(data,model_points_M_mm=line))['valid']
    assert not extract(dict(data,marker_ids=[1,2,3],model_points_M_mm=model[:3].tolist(),observed_points_C_mm=data['observed_points_C_mm'][:3]))['valid']
    wrong=np.asarray(data['observed_points_C_mm']).copy();wrong[0]+=10
    assert not extract(dict(data,observed_points_C_mm=wrong.tolist()))['valid']
    return data,out

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--input',type=Path);parser.add_argument('--output',type=Path)
    parser.add_argument('--save-demo',type=Path,help='Directory for synthetic input/output JSON')
    args=parser.parse_args()
    if args.input:
        result=extract(json.loads(args.input.read_text(encoding='utf-8')))
    else:
        data,result=demo()
        if args.save_demo:
            args.save_demo.mkdir(parents=True,exist_ok=True)
            (args.save_demo/'pose-input.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
            (args.save_demo/'pose-output.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    text=json.dumps(result,indent=2)
    if args.output:args.output.write_text(text,encoding='utf-8')
    print(text)

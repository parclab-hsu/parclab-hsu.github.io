# 강의자료 생성 그림 (docs/img/25~30) 생성기
# 실행: python3 tools/make_figures.py   (matplotlib + Noto Sans CJK KR 필요)
# 출력: docs/img/25~28_*.png  — 그림을 고칠 때는 PNG가 아니라 이 파일을 고친다

import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle
OUT="/mnt/nas-drive/Class/C_Langague/parclab-hsu.github.io-git/courses-src/c-programming-202602/docs/img/"
KR='Noto Sans CJK KR'; MONO='Noto Sans Mono CJK KR'
BLUE='#3B6FE3'; GREEN='#1E8E44'; ORANGE='#E8930C'; PURPLE='#7B4DEA'; RED='#DC4437'
INK='#202124'; GRAY='#5F6368'; LGRAY='#9AA0A6'; FAINT='#EDEFF2'
plt.rcParams['font.family']=[KR]

def canvas(w=14.0,h=6.3):
    fig=plt.figure(figsize=(w,h),dpi=100,facecolor='white')
    ax=fig.add_axes([0,0,1,1]); ax.set_xlim(0,140); ax.set_ylim(0,63); ax.axis('off')
    return fig,ax
def title(ax,t,y=57.5,size=21):
    ax.text(70,y,t,ha='center',va='center',fontsize=size,fontweight='bold',color=INK)
def caption(ax,t,y=4.0,size=12.5,color=GRAY):
    ax.text(70,y,t,ha='center',va='center',fontsize=size,color=color)
def box(ax,x,y,w,h,label,fc,tc='white',size=14,bold=True,r=1.2,sub=None,subcolor=GRAY,alpha=1.0,ec='none'):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle=f"round,pad=0,rounding_size={r}",
                 fc=fc,ec=ec,lw=1.4,alpha=alpha,zorder=2))
    ax.text(x+w/2,y+h/2,label,ha='center',va='center',fontsize=size,color=tc,
            fontweight='bold' if bold else 'normal',zorder=3,linespacing=1.5)
    if sub: ax.text(x+w/2,y-2.2,sub,ha='center',va='center',fontsize=10.5,color=subcolor)
def arrow(ax,x1,y1,x2,y2,color=LGRAY,lw=2.0,label=None,ls='-',rad=0.0,lsize=10.5,lc=None,ly=1.7):
    ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle='-|>',mutation_scale=17,
                 lw=lw,color=color,linestyle=ls,zorder=1,
                 connectionstyle=f"arc3,rad={rad}"))
    if label: ax.text((x1+x2)/2,(y1+y2)/2+ly,label,ha='center',va='center',fontsize=lsize,color=lc or GRAY)
def save(fig,name):
    fig.savefig(OUT+name,dpi=100,facecolor='white'); plt.close(fig); print("  생성:",name)

# ---------- 25. 요구사항을 적었는가 ----------
fig,ax=canvas()
title(ax,"요구사항을 적었는가 — 세 번 고치기 vs 세 단계로 쌓기")
ax.text(4,45.5,"적지 않으면",fontsize=13,fontweight='bold',color=RED,ha='left',va='center')
xs=[18,42,66,90,114]
lb=["만든다","“이게\n아닌데”","고친다","“이것도\n아닌데”","또 고친다"]
cl=[RED,'#F6D5D2',RED,'#F6D5D2',RED]
tc=['white',RED,'white',RED,'white']
for x,l,c,t in zip(xs,lb,cl,tc): box(ax,x,39,20,9,l,c,tc=t,size=12.5)
for i in range(4): arrow(ax,xs[i]+20,43.5,xs[i+1],43.5,color='#D98A84',lw=1.8)
ax.add_patch(FancyArrowPatch((124,38.6),(28,38.6),arrowstyle='-|>',mutation_scale=15,
             lw=1.6,color='#D98A84',linestyle=(0,(4,3)),connectionstyle="arc3,rad=-0.13",zorder=1))
ax.text(76,33.2,"요구사항이 없으니 만들고 나서야 아닌 걸 안다 — 같은 일을 반복",
        fontsize=11,color=RED,ha='center',zorder=4,
        bbox=dict(facecolor='white',edgecolor='none',pad=3.0))

ax.text(4,25.5,"SRS를 먼저",fontsize=13,fontweight='bold',color=GREEN,ha='left',va='center')
xs2=[18,42,66,90,114]
lb2=["SRS를\n적는다","1단계\n값 출력","2단계\n단위·자릿수","3단계\n표 정렬","검증 ✓"]
cl2=[BLUE,GREEN,GREEN,GREEN,'#0E6B33']
for x,l,c in zip(xs2,lb2,cl2): box(ax,x,19,20,9,l,c,size=12.5)
for i in range(4): arrow(ax,xs2[i]+20,23.5,xs2[i+1],23.5,color='#8FC7A3',lw=1.8)
ax.text(124,15.6,"적어 둔 검증 방법대로 확인",fontsize=10.5,color=GREEN,ha='center')
caption(ax,"5절에서 대시보드를 세 번 고친 이유 — 무엇을 만들지 먼저 적지 않았기 때문이다")
save(fig,"25_srs_vs_no_srs.png")

# ---------- 26. 모듈 경계 ----------
fig,ax=canvas()
title(ax,"모듈 — 한 가지 일만 맡는 덩어리")
xs=[10,55,100]; cols=[ORANGE,PURPLE,BLUE]
names=["입력","계산","출력"]
inner=["바깥에서\n값을 받아 온다","받은 값으로\n새 값을 만든다","값을 사람이\n읽게 보여 준다"]
weeks=["3주차 · scanf_s()","4주차 · 연산자","2주차 · printf()  ← 지금"]
wcol=[GRAY,GRAY,BLUE]
for x,c,n,ins,w,wc in zip(xs,cols,names,inner,weeks,wcol):
    box(ax,x,26,30,17,"",c,r=1.6)
    ax.text(x+15,38.5,n,ha='center',va='center',fontsize=17,fontweight='bold',color='white')
    ax.text(x+15,31.5,ins,ha='center',va='center',fontsize=11.5,color='white',linespacing=1.6)
    ax.text(x+15,22.6,w,ha='center',va='center',fontsize=11,color=wc,fontweight='bold' if wc==BLUE else 'normal')
arrow(ax,40,34.5,55,34.5,label="숫자 값",lw=2.2)
arrow(ax,85,34.5,100,34.5,label="계산 결과",lw=2.2)
ax.add_patch(FancyBboxPatch((10,10.5),120,7.2,boxstyle="round,pad=0,rounding_size=1.2",fc=FAINT,ec='none'))
ax.text(70,14.1,"“이 덩어리는 〈무엇〉을 받아서 〈무엇〉을 내놓는다”",
        ha='center',va='center',fontsize=14,color=INK,fontweight='bold')
caption(ax,"이 문장이 안 채워지면 덩어리가 두 가지 일을 하고 있다는 뜻 — 그때는 더 쪼갠다.  덩어리에 이름을 붙이는 문법이 7주차 함수다")
save(fig,"26_module_boundary.png")

# ---------- 27. 형식 문자열 → 화면 칸 ----------
fig,ax=canvas(14.0,6.6); ax.set_ylim(0,66)
title(ax,"검증할 수 있는 요구사항 —  %-10s  %7.1f  는 화면에서 이 칸이다",y=60,size=20)
ax.text(70,52.5,'printf("%-10s %7.1f km/h\\n", "Speed", speed);',
        ha='center',va='center',fontsize=15.5,family=MONO,color=INK)
cw=5.0; x0=70-(23*cw)/2; ytop=32; ch=8.5
cells=list("Speed     ")+[" "]+list("   42.5")+list(" km/h")
groups=[(0,10,BLUE),(10,11,None),(11,18,GREEN),(18,23,None)]
for i,ch_ in enumerate(cells):
    if i>=23: break
    g=next((c for a,b,c in groups if a<=i<b),None)
    fc='white' if g is None else ('#DCE6FA' if g==BLUE else '#DCEFE2')
    ec=LGRAY if g is None else (BLUE if g==BLUE else GREEN)
    if i>=18: fc='#F1F3F4'; ec=LGRAY
    ax.add_patch(Rectangle((x0+i*cw,ytop),cw,ch,fc=fc,ec=ec,lw=1.1,zorder=2))
    ax.text(x0+i*cw+cw/2,ytop+ch/2,ch_,ha='center',va='center',fontsize=15,family=MONO,color=INK,zorder=3)
def brace(x1,x2,y,color,text,sub):
    ax.plot([x1,x1,x2,x2],[y+1.4,y,y,y+1.4],color=color,lw=1.6)
    ax.text((x1+x2)/2,y-3.2,text,ha='center',va='center',fontsize=12.5,color=color,fontweight='bold')
    ax.text((x1+x2)/2,y-6.6,sub,ha='center',va='center',fontsize=10.5,color=GRAY)
brace(x0,x0+10*cw,ytop-1.6,BLUE,"%-10s → 10칸","항목명, 왼쪽 정렬")
brace(x0+11*cw,x0+18*cw,ytop-1.6,GREEN,"%7.1f → 7칸","값, 오른쪽 정렬 · 소수 1자리")
brace(x0+18*cw,x0+23*cw,ytop-1.6,GRAY,"km/h","그대로 나가는 문자")
ax.add_patch(FancyBboxPatch((16,10.5),108,7.6,boxstyle="round,pad=0,rounding_size=1.2",fc='#F1F3F4',ec='none'))
ax.text(38,14.3,"X",ha='center',va='center',fontsize=15,color=RED,fontweight='bold')
ax.text(41.5,14.3,"“보기 좋게 출력한다”",ha='left',va='center',fontsize=13.5,color=GRAY)
ax.text(80,14.3,"✓",ha='center',va='center',fontsize=15,color=GREEN,fontweight='bold')
ax.text(83.5,14.3,"“항목명 %-10s, 값 %7.1f 로 출력한다”",ha='left',va='center',fontsize=13.5,color=INK)
caption(ax,"칸 수와 자릿수를 적어야 다 됐는지 확인할 수 있다 — 폭을 바꾸면 기대 출력도 같이 바꾼다",y=4.5)
save(fig,"27_format_to_columns.png")

# ---------- 28. AI 프롬프트 ----------
fig,ax=canvas()
title(ax,"AI에게 시킬 때 — 적지 않으면 AI가 대신 정한다")
ax.add_patch(FancyBboxPatch((4,8),64,42,boxstyle="round,pad=0,rounding_size=1.6",fc='#FDF3F2',ec='none'))
ax.add_patch(FancyBboxPatch((72,8),64,42,boxstyle="round,pad=0,rounding_size=1.6",fc='#F1F8F3',ec='none'))
box(ax,9,41,54,7,"“대시보드 만들어줘”",RED,size=13.5)
box(ax,77,41,54,7,"[목적][입력][출력][제약][검증]",GREEN,size=13.5)
bad=["단위가 mph","소수 6자리","구조체 사용"]
for i,t in enumerate(bad):
    box(ax,9+i*18.2,29,16.6,7.5,t,'white',tc=RED,size=11,bold=False,ec='#E7B4AE')
good=["규격대로","규격대로","규격대로"]
for i,t in enumerate(good):
    box(ax,77+i*18.2,29,16.6,7.5,t,'white',tc=GREEN,size=11,bold=False,ec='#A8CFB6')
arrow(ax,36,40.6,36,37.0,color='#D98A84',lw=1.8); arrow(ax,104,40.6,104,37.0,color='#8FC7A3',lw=1.8)
ax.text(36,24.5,"결과가 매번 다르다",ha='center',fontsize=12.5,color=RED,fontweight='bold')
ax.text(36,20.6,"무엇이 맞는지 판단할 기준이 없다",ha='center',fontsize=11,color=GRAY)
ax.text(36,15.5,"안 배운 문법이 섞여 들어온다",ha='center',fontsize=11,color=GRAY)
ax.text(104,24.5,"결과가 거의 같다",ha='center',fontsize=12.5,color=GREEN,fontweight='bold')
ax.text(104,20.6,"① 출력 형식  ② 제약  ③ 실행 검증",ha='center',fontsize=11,color=GRAY)
ax.text(104,15.5,"“2주차까지 배운 문법만” 이 한 줄이 막아 준다",ha='center',fontsize=11,color=GRAY)
caption(ax,"빈칸은 AI가 그럴듯하게 채운다 — 적어 두면 “내가 시킨 적 없는 것”이 바로 눈에 보인다")
save(fig,"28_ai_prompt_srs.png")

# ---------- 29. 포인터 연산 (12주차 8절) ----------
fig,ax=canvas()
title(ax,"포인터 연산 —  p + 1  은 ‘1바이트’가 아니라 ‘한 칸’")
ax.text(70,52.0,"같은 16바이트 메모리라도, 포인터가 무엇을 가리키느냐에 따라 ‘한 칸’의 크기가 다르다",
        ha='center',va='center',fontsize=12,color=GRAY)
rows=[("char *p",  16, ORANGE, '#FDF0DC', "1바이트"),
      ("int *p",    4, BLUE,   '#EAF0FC', "4바이트  (int 크기)"),
      ("double *p", 2, GREEN,  '#E4F1E9', "8바이트  (double 크기)")]
X0, W, H = 32.0, 92.0, 7.5
for k,(name,n,col,tint,jump) in enumerate(rows):
    y = 38 - k*13.5
    cw = W/n
    ax.text(28,y+H/2,name,ha='right',va='center',fontsize=13.5,family=MONO,
            color=col,fontweight='bold')
    for i in range(n):
        ax.add_patch(Rectangle((X0+i*cw,y),cw,H,fc=tint if i<2 else 'white',ec=col,lw=1.2,zorder=2))
    ax.text(X0+cw*0.5,y+H/2,"p",ha='center',va='center',fontsize=12.5,family=MONO,
            color=INK,fontweight='bold',zorder=3)
    ax.text(X0+cw*1.5,y+H/2,"p + 1",ha='center',va='center',fontsize=12.5,family=MONO,
            color=RED,fontweight='bold',zorder=3)
    ay=y+H+2.1
    ax.add_patch(FancyArrowPatch((X0+cw*0.5,ay),(X0+cw*1.5,ay),arrowstyle='-|>',
                 mutation_scale=14,lw=1.7,color=RED,zorder=3))
    ax.text(X0+cw*1.5+2.0,ay,jump,ha='left',va='center',fontsize=11,color=RED)
    ax.text(X0+W+2.5,y+H/2,f"칸 {n}개",ha='left',va='center',fontsize=10.5,color=LGRAY)
caption(ax,"가리키는 자료형의 크기만큼 움직인다 — 그래서 배열에서 p + 1 이 정확히 ‘다음 원소’가 된다",y=5.0)
save(fig,"29_pointer_arith.png")

# ---------- 30. 포인터 배열 vs 배열 포인터 (13주차) ----------
fig,ax=canvas()
title(ax,"포인터 배열  vs  배열 포인터 — 괄호 하나가 뜻을 바꾼다")
ax.add_patch(FancyBboxPatch((3,9),64,42,boxstyle="round,pad=0,rounding_size=1.6",fc='#FDF6EC',ec='none'))
ax.add_patch(FancyBboxPatch((73,9),64,42,boxstyle="round,pad=0,rounding_size=1.6",fc='#EDF2FD',ec='none'))
ax.text(35,47.5,"int *p[3];",ha='center',fontsize=17,family=MONO,color=ORANGE,fontweight='bold')
ax.text(35,43.2,"포인터 배열 — 포인터가 3개",ha='center',fontsize=12.5,color=INK,fontweight='bold')
for i in range(3):
    y=34-i*7.5
    box(ax,8,y,11,5.6,f"p[{i}]",ORANGE,size=11.5,r=0.7)
    arrow(ax,19.5,y+2.8,33,y+2.8,color='#D9A24E',lw=1.7)
    ax.add_patch(Rectangle((33,y),9,5.6,fc='white',ec=ORANGE,lw=1.2,zorder=2))
    ax.text(37.5,y+2.8,str(10*(i+1)),ha='center',va='center',fontsize=11.5,family=MONO,color=INK,zorder=3)
    ax.text(45,y+2.8,"따로 떨어진 곳",ha='left',va='center',fontsize=10,color=GRAY)
ax.text(35,11.6,"각 칸이 서로 다른 곳을 가리킨다",ha='center',fontsize=11,color=ORANGE)
ax.text(105,47.5,"int (*p)[3];",ha='center',fontsize=17,family=MONO,color=BLUE,fontweight='bold')
ax.text(105,43.2,"배열 포인터 — 포인터는 1개",ha='center',fontsize=12.5,color=INK,fontweight='bold')
box(ax,78,26.5,11,5.6,"p",BLUE,size=11.5,r=0.7)
arrow(ax,89.5,29.3,100,29.3,color='#7FA3EE',lw=1.7)
ax.add_patch(FancyBboxPatch((99.5,23.5),31,11.6,boxstyle="round,pad=0,rounding_size=0.9",
             fc='none',ec=BLUE,lw=2.0,ls='--',zorder=2))
for i in range(3):
    ax.add_patch(Rectangle((101+i*9.5,26.5),9,5.6,fc='white',ec=BLUE,lw=1.2,zorder=3))
    ax.text(105.5+i*9.5,29.3,str(10*(i+1)),ha='center',va='center',fontsize=11.5,family=MONO,color=INK,zorder=4)
ax.text(115,37.5,"int 3개짜리 배열 ‘하나’",ha='center',fontsize=10.5,color=BLUE)
ax.text(105,17.5,"(*p)[0] 처럼 배열을 먼저 꺼낸 뒤 인덱스",ha='center',fontsize=11,color=BLUE)
ax.text(105,11.6,"p + 1 은 배열 한 줄만큼 건너뛴다",ha='center',fontsize=11,color=GRAY)
ax.add_patch(FancyBboxPatch((3,1.2),134,6.4,boxstyle="round,pad=0,rounding_size=1.0",fc=FAINT,ec='none'))
ax.text(70,4.4,"읽는 규칙:  괄호가 없으면 [ ] 가 먼저 → “포인터의 배열”      |      괄호로 묶으면 * 가 먼저 → “배열을 가리키는 포인터”",
        ha='center',va='center',fontsize=12.5,color=INK,fontweight='bold')
save(fig,"30_ptr_array_vs_array_ptr.png")

G="#c8aa5e"
W,Hh=1240,680
s=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hh}" width="{W}" height="{Hh}">']
def P(d,sw=1.6): s.append(f'<path d="{d}" fill="none" stroke="{G}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>')
def Ln(x1,y1,x2,y2,sw=1.2): s.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{G}" stroke-width="{sw}"/>')
def Rc(x,y,w,h,sw=1.8): s.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="none" stroke="{G}" stroke-width="{sw}"/>')
def Ci(cx,cy,r,sw=1.4): s.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="{G}" stroke-width="{sw}"/>')

def awin(x,yb,w,h,mull=True,tr=True,key=True):
    r=w/2; ysp=yb-(h-r)
    P(f"M{x:.1f} {yb:.1f} L{x:.1f} {ysp:.1f} A{r:.1f} {r:.1f} 0 0 1 {x+w:.1f} {ysp:.1f} L{x+w:.1f} {yb:.1f} Z",1.3)
    Ln(x-2,yb,x+w+2,yb,1.3)
    if tr: Ln(x,ysp,x+w,ysp,0.9)
    if mull: Ln(x+w/2,yb,x+w/2,ysp-r+4,0.9)
    if key:
        kx=x+w/2; ky=ysp-r
        P(f"M{kx-3:.1f} {ky-1:.1f} L{kx+3:.1f} {ky-1:.1f} L{kx+2:.1f} {ky-8:.1f} L{kx-2:.1f} {ky-8:.1f} Z",0.9)

def oculus(cx,cy,r):
    Ci(cx,cy,r); Ci(cx,cy,r-3,0.9); Ln(cx-r,cy,cx+r,cy,0.8); Ln(cx,cy-r,cx,cy+r,0.8)

def pyramid(ax,bx,by,tx,ty,n=5):
    P(f"M{ax:.1f} {by:.1f} L{tx:.1f} {ty:.1f} L{bx:.1f} {by:.1f}",2.0)
    for i in range(1,n+1):
        f=i/(n+1)
        Ln(ax+(tx-ax)*f, by+(ty-by)*f, bx+(tx-bx)*f, by+(ty-by)*f, 0.8)

def hiproof(elx,erx,ey,rlx,rrx,ry,n=5):
    P(f"M{elx:.1f} {ey:.1f} L{rlx:.1f} {ry:.1f} L{rrx:.1f} {ry:.1f} L{erx:.1f} {ey:.1f}",2.0)
    Ln(elx,ey,erx,ey,1.4)
    for i in range(1,n+1):
        f=i/(n+1); ly=ey+(ry-ey)*f
        Ln(elx+(rlx-elx)*f, ly, erx+(rrx-erx)*f, ly, 0.8)

def urn(cx,baseY):
    Rc(cx-9,baseY-24,18,24,1.2); Ln(cx-13,baseY-24,cx+13,baseY-24,1.2)
    P(f"M{cx-13:.1f} {baseY-27:.1f} C{cx-15:.1f} {baseY-42:.1f} {cx-6:.1f} {baseY-46:.1f} {cx-7:.1f} {baseY-53:.1f} L{cx+7:.1f} {baseY-53:.1f} C{cx+6:.1f} {baseY-46:.1f} {cx+15:.1f} {baseY-42:.1f} {cx+13:.1f} {baseY-27:.1f} Z",1.2)
    for dx in (-4,0,4): Ln(cx+dx,baseY-53,cx+dx*2.2,baseY-66,0.8)

GROUND=470
# ===== TUERME =====
TW=140; LT=(178,178+TW); RT=(W-178-TW,W-178); TTOP=120
for (tx1,tx2) in (LT,RT):
    cxt=(tx1+tx2)/2
    Rc(tx1,TTOP,TW,GROUND-TTOP,2.0)
    # Eckquaderung
    for qy in range(int(TTOP)+14,int(GROUND)-10,30):
        Ln(tx1,qy,tx1+9,qy,0.7); Ln(tx2-9,qy,tx2,qy,0.7)
    # Gesims unter Dach
    Ln(tx1-5,TTOP,tx2+5,TTOP,1.4); Ln(tx1-3,TTOP-6,tx2+3,TTOP-6,1.0)
    # Pyramidendach + Spitze
    pyramid(tx1-7,tx2+7,TTOP-6,cxt,TTOP-78,5)
    Ln(cxt,TTOP-78,cxt,TTOP-104,1.4); Ci(cxt,TTOP-110,5); Ln(cxt,TTOP-115,cxt,TTOP-126,1.0)
    # Etagenfenster (mit Sprossen) + Geschossbaender
    for yb,h in ((TTOP+62,54),(300,48),(452,66)):
        awin(cxt-19,yb,38,h)
    Ln(tx1,258,tx2,258,0.9); Ln(tx1,338,tx2,338,0.9)

# ===== MITTELBAU =====
CL,CR=LT[1],RT[0]; CTOP=172
Rc(CL,CTOP,CR-CL,GROUND-CTOP,2.0)
# Walmdach mit Ziegeln
hiproof(CL-14,CR+14,CTOP,CL+78,CR-78,CTOP-62,6)
# Schornsteine
for chx in (CL+120,CR-120):
    Rc(chx-9,CTOP-92,18,30,1.4); Ln(chx-12,CTOP-92,chx+12,CTOP-92,1.2)
# Gesimsbaender
for yy in (252,196,352): Ln(CL,yy,CR,yy,1.0)
Ln(CL,CTOP+6,CR,CTOP+6,0.9)
# Achsen
import math
n=6; ww=46; gap=34; span=n*ww+(n-1)*gap; start=(CL+CR)/2-span/2
xs=[start+i*(ww+gap) for i in range(n)]
for x in xs:
    awin(x,300,ww,86)            # 1.OG hohe Fenster
    oculus(x+ww/2,176,12)        # Okuli mit Kreuz
    awin(x,460,46,76,key=True)   # EG Arkade
# Eckquaderung Mittelbau
for qy in range(int(CTOP)+14,int(GROUND)-10,30):
    Ln(CL,qy,CL+10,qy,0.7); Ln(CR-10,qy,CR,qy,0.7)

# ===== GARTEN-VORDERGRUND =====
Ln(60,GROUND,W-60,GROUND,1.6)
# Hecke (Bogenkante) mit Mittel-Luecke
hy=GROUND+16
x=120
while x< W-120:
    if not (560< x <680):
        P(f"M{x:.1f} {hy:.1f} A14 12 0 0 1 {x+28:.1f} {hy:.1f}",0.9)
    x+=28
# Weg (perspektivisch) zum Portal
Ln(560,Hh-6,602,GROUND+4,1.2); Ln(680,Hh-6,638,GROUND+4,1.2)
for yy in range(int(GROUND)+22, Hh-6, 26):
    f=(yy-GROUND)/(Hh-GROUND)
    Ln(602-(602-560)*f, yy, 638+(680-638)*f, yy, 0.6)
# Vasen flankierend
urn(545,GROUND+96); urn(695,GROUND+96)
s.append('</svg>')
open('/Users/leitungwms/Documents/CEO-GPT/outputs/website-vorschau/ecpa/img/castle-outline.svg','w').write("\n".join(s))
print("detaillierte Schloss-Outline geschrieben, Elemente:",len(s))

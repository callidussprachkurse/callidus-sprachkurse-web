import math, json

W,H = 720,720
CX,CY,R = 360,360,300
LAT0,LON0 = 32.0,16.0
GOLD="#c2a14e"; GOLDS="#e2cd96"

def proj(lat,lon):
    la,lo=math.radians(lat),math.radians(lon)
    la0,lo0=math.radians(LAT0),math.radians(LON0)
    cosc=math.sin(la0)*math.sin(la)+math.cos(la0)*math.cos(la)*math.cos(lo-lo0)
    x=R*math.cos(la)*math.sin(lo-lo0)
    y=R*(math.cos(la0)*math.sin(la)-math.sin(la0)*math.cos(la)*math.cos(lo-lo0))
    return CX+x, CY-y, cosc

def densify(ring, step=2.0):
    out=[]
    n=len(ring)
    for i in range(n):
        lo0,la0=ring[i]; lo1,la1=ring[(i+1)%n]
        out.append((lo0,la0))
        d=math.hypot(lo1-lo0,la1-la0); m=int(d/step)
        for k in range(1,m):
            f=k/m; out.append((lo0+(lo1-lo0)*f, la0+(la1-la0)*f))
    return out

def limb(x,y):
    dx,dy=x-CX,y-CY; dl=math.hypot(dx,dy) or 1
    return CX+dx/dl*R, CY+dy/dl*R

def clip_ring(ring):
    pp=[(proj(la,lo),(lo,la)) for lo,la in ring]
    vis=[p[0][2]>=0 for p in pp]
    if not any(vis): return []
    if all(vis): return [[(p[0][0],p[0][1]) for p in pp]]
    h=vis.index(False); pp=pp[h:]+pp[:h]
    n=len(pp); subs=[]; cur=[]
    for i in range(n):
        (x0,y0,c0),(lo0,la0)=pp[i]
        (x1,y1,c1),(lo1,la1)=pp[(i+1)%n]
        v0=c0>=0; v1=c1>=0
        if v0: cur.append((x0,y0))
        if v0!=v1:
            t=c0/(c0-c1); clo=lo0+(lo1-lo0)*t; cla=la0+(la1-la0)*t
            px,py,_=proj(cla,clo); px,py=limb(px,py)
            cur.append((px,py))
            if v0 and not v1:
                if len(cur)>2: subs.append(cur)
                cur=[]
    if len(cur)>2: subs.append(cur)
    return subs

# Laenderdaten
data=json.load(open('/tmp/ne_land.geojson'))
rings=[]
for f in data['features']:
    g=f['geometry']; co=g['coordinates']
    polys=[co] if g['type']=='Polygon' else (co if g['type']=='MultiPolygon' else [])
    for poly in polys:
        ext=poly[0]
        rings.append([(p[0],p[1]) for p in ext[:-1]])

land_paths=[]
for ring in rings:
    for sub in clip_ring(densify(ring,2.0)):
        d="M"+" L".join("%.1f %.1f"%(x,y) for x,y in sub)+" Z"
        land_paths.append(d)

# Knoten + Ziel
NODES=[("New York",40.7,-74),("Sao Paulo",-23.5,-46.6),("London",51.5,-0.1),("Madrid",40.4,-3.7),
       ("Rome",41.9,12.5),("Stockholm",59.3,18.1),("Moscow",55.7,37.6),("Istanbul",41,29),
       ("Cairo",30,31),("Lagos",6.5,3.4),("Cape Town",-33.9,18.4),("Dubai",25.2,55.3),
       ("Mumbai",19.1,72.9),("Beijing",39.9,116.4),("Reykjavik",64.1,-21.9)]
BERLIN=(52.5,13.4)

s=[]
s.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Georgia, serif">')
s.append(f'''<defs>
  <radialGradient id="sea" cx="40%" cy="36%" r="75%">
    <stop offset="0%" stop-color="#1c365f"/><stop offset="58%" stop-color="#102545"/><stop offset="100%" stop-color="#0a1830"/>
  </radialGradient>
  <radialGradient id="halo" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="{GOLD}" stop-opacity="0.6"/><stop offset="100%" stop-color="{GOLD}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <clipPath id="g"><circle cx="{CX}" cy="{CY}" r="{R}"/></clipPath>
</defs>''')
s.append(f'<circle cx="{CX}" cy="{CY}" r="{R+8}" fill="{GOLD}" opacity="0.10" filter="url(#soft)"/>')
s.append(f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="url(#sea)"/>')
s.append(f'<g clip-path="url(#g)">')
# Land
for d in land_paths:
    s.append(f'<path d="{d}" fill="#33527e" fill-opacity="0.78" stroke="#5d80b0" stroke-width="0.5" stroke-opacity="0.45"/>')
# Gitter
def segs(points):
    out=[]; cur=[]
    for la,lo in points:
        x,y,c=proj(la,lo)
        if c>=0: cur.append((x,y))
        else:
            if len(cur)>1: out.append(cur)
            cur=[]
    if len(cur)>1: out.append(cur)
    return out
for lon in range(-180,181,30):
    for seg in segs([(la,lon) for la in range(-90,91,2)]):
        s.append('<path d="M'+ " L".join("%.1f %.1f"%(x,y) for x,y in seg)+f'" fill="none" stroke="{GOLD}" stroke-width="0.5" opacity="0.10"/>')
for lat in range(-60,61,30):
    for seg in segs([(lat,lo) for lo in range(-180,181,2)]):
        s.append('<path d="M'+ " L".join("%.1f %.1f"%(x,y) for x,y in seg)+f'" fill="none" stroke="{GOLD}" stroke-width="0.5" opacity="0.10"/>')
s.append('</g>')
s.append(f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="none" stroke="{GOLD}" stroke-width="1.2" opacity="0.45"/>')

bx,by,bc=proj(*BERLIN)
for name,la,lo in NODES:
    x,y,c=proj(la,lo)
    if c<0.04: continue
    mx,my=(x+bx)/2,(y+by)/2; ox,oy=mx-CX,my-CY; ol=math.hypot(ox,oy) or 1
    L=math.hypot(bx-x,by-y); k=0.20*L+10
    s.append(f'<path d="M{x:.1f} {y:.1f} Q{mx+ox/ol*k:.1f} {my+oy/ol*k:.1f} {bx:.1f} {by:.1f}" fill="none" stroke="{GOLD}" stroke-width="1.3" opacity="0.6" stroke-linecap="round"/>')
    s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.4" fill="{GOLDS}" opacity="0.92"/>')
s.append(f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="20" fill="url(#halo)"/>')
s.append(f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="5.2" fill="{GOLDS}"/>')
s.append(f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="5.2" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.6"/>')
s.append(f'<text x="{bx:.1f}" y="{by-15:.1f}" fill="{GOLDS}" font-size="15" letter-spacing="3" text-anchor="middle">GERMANY</text>')
s.append('</svg>')

open('/Users/leitungwms/Documents/CEO-GPT/outputs/website-vorschau/ecpa/img/ecpa-globe.svg','w').write("\n".join(s))
print("wrote globe, land paths:",len(land_paths))

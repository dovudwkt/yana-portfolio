from PIL import Image
import sys
d=sys.argv[1]; pairs=[('cy_ext_day','cy_ext_night'),('cy_pergola_day','cy_pergola_night'),('cy_bbq_day','cy_bbq_night')]
rows=[]
for a,b in pairs:
    A=Image.open(f'{d}/{a}.jpg').convert('RGB').resize((640,360)); B=Image.open(f'{d}/{b}.jpg').convert('RGB').resize((640,360))
    blend=Image.blend(A,B,0.5)
    r=Image.new('RGB',(1920,360)); r.paste(A,(0,0)); r.paste(B,(640,0)); r.paste(blend,(1280,0)); rows.append(r)
s=Image.new('RGB',(1920,360*len(rows)))
for i,r in enumerate(rows): s.paste(r,(0,i*360))
s.save(sys.argv[2],quality=80)

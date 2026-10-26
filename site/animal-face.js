// Facial details are painted onto the head surface, without protruding eyeballs or cheek meshes.
export function makeAnimalFace(T,p,baseOnly=false){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const c=canvas.getContext('2d');c.fillStyle=p.fur;c.fillRect(0,0,1024,512);
  const oval=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const path=(points,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(...points[0]);for(const q of points.slice(1))c.lineTo(...q);c.closePath();c.fill();};
  // SphereGeometry's +Z face is centred at one quarter of its horizontal UV range.
  if(p.id==='macaque')oval(256,263,125,131,p.light);
  else if(p.id==='beagle'){
    path([[235,96],[277,96],[286,264],[226,264]],p.light);oval(256,325,100,66,p.light);
  }else if(p.id==='horse'){
    path([[242,112],[270,112],[277,260],[235,260]],p.light);oval(256,332,87,52,p.light);
  }else if(p.id==='boar')oval(256,329,77,41,'#dfb2a2');
  else oval(256,334,p.id==='hamster'?116:90,65,p.light);
  if(p.id==='meerkat')for(const side of[-1,1])oval(256+side*70,232,58,73,p.dark);
  if(!baseOnly)for(const side of[-1,1]){
    const x=256+side*70;
    oval(x,235,43,56,'#fffaf0');oval(x-side*4,239,30,44,p.dark);oval(x-side*4,241,22,35,'#292a30');
    oval(x-12,218,10,13,'#fffaf0');oval(x+10,256,4,5,'#fffaf0');
  }
  if(p.id==='cat'){
    for(const side of[-1,1]){
      path([[256+side*36,118],[256+side*53,124],[256+side*45,171]],p.dark);
      path([[256+side*74,135],[256+side*91,146],[256+side*80,182]],p.dark);
    }
    if(!baseOnly)path([[242,304],[270,304],[256,318]],'#c77e79');
  }else if(p.id==='horse'||p.id==='boar'){
    for(const side of[-1,1])oval(256+side*27,326,9,6,p.dark);
  }else if(!baseOnly)oval(256,309,16,10,p.id==='hamster'?'#c88279':'#3e3836');
  if(!baseOnly){c.strokeStyle=p.dark;c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(238,345);c.quadraticCurveTo(256,355,274,345);c.stroke();}
  if(p.id==='hamster'){c.fillStyle='#fffaf0';c.fillRect(248,348,16,13);}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=2;
  return texture;
}

import { buildToonRacer } from './toon-racer.js?build=20261031-wildlife3';
// High-detail studio sample. Opt-in only; race models stay at their existing cost.
export function buildPremiumCat(T,p){
  const base=buildToonRacer(T,p),{driver}=base,old=base.head;old.removeFromParent();old.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
  const head=new T.Group();head.name='premium-cat-head';head.position.set(0,1.43,-.12);driver.add(head);
  const mat=(color,roughness=.5,extra={})=>new T.MeshPhysicalMaterial({color,roughness,...extra});
  let seed=73591;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const ctx=cv.getContext('2d');ctx.fillStyle='#858585';ctx.fillRect(0,0,1024,512);
  // Short directional strands modulate the surface normal instead of adding fur shells.
  for(let i=0;i<42000;i++){const x=random()*1024,y=random()*512,v=75+Math.floor(random()*100);ctx.strokeStyle=`rgb(${v},${v},${v})`;ctx.lineWidth=.35+random()*.7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(random()-.5)*2,y+2+random()*5);ctx.stroke();}
  const bump=new T.CanvasTexture(cv);bump.wrapS=T.RepeatWrapping;
  const fur=mat('#ffffff',.68,{vertexColors:true,bumpMap:bump,bumpScale:.008}),orange=mat('#e89a37',.62,{bumpMap:bump,bumpScale:.006}),cream=mat('#fff0d4',.7,{bumpMap:bump,bumpScale:.005}),pink=mat('#d38183',.6),ink=mat('#27212b',.36),white=mat('#fff9e9',.2),lip=mat('#a95e51',.65),mouth=mat('#3c202a',.68),tongue=mat('#e88b96',.42),eyeGreen=mat('#458f69',.28),nose=mat('#d98786',.28,{clearcoat:.3});
  const w=.51,h=.435,d=.385;
  const bumpAt=(x,y)=>.085*Math.exp(-((x/.28)**4+((y+.15)/.15)**4))+.025*(Math.exp(-(((x-.27)/.13)**2+((y+.10)/.16)**2))+Math.exp(-(((x+.27)/.13)**2+((y+.10)/.16)**2)));
  const depth=(x,y)=>d*Math.sqrt(Math.max(.015,1-(x/w)**2-(y/h)**2))+bumpAt(x,y);
  function ell(parent,x,y,z,sx,sy,sz,m,name=''){const o=new T.Mesh(new T.SphereGeometry(1,48,32),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function line(parent,points,r,m,name=''){const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),32,r,8,false),m);o.name=name;o.castShadow=true;parent.add(o);return o;}
  const geometry=new T.SphereGeometry(1,128,96),pos=geometry.attributes.position,colors=[];
  const ginger=new T.Color('#df882c'),pale=new T.Color('#ffe8ca'),stripe=new T.Color('#85431e'),color=new T.Color();
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i)*w,y=pos.getY(i)*h,z=pos.getZ(i)*d,front=Math.max(0,z/d);pos.setXYZ(i,x,y,z+bumpAt(x,y)*Math.min(1,front*3));
    color.copy(ginger);const chin=Math.max(0,Math.min(1,(-y-.10)/.14))*front;const muzzle=Math.exp(-((x/.29)**6+((y+.18)/.15)**6))*front;color.lerp(pale,Math.max(chin,muzzle));
    const a=Math.atan2(x,z),crown=y>.20&&z>0&&Math.abs(Math.sin(x*27+y*3))<.27,side=Math.abs(a)>.85&&Math.abs(Math.sin(y*27+Math.cos(a*2)*.7))<.27&&y>-.2;
    if(crown||side)color.lerp(stripe,.83);const grain=(random()-.5)*.045;color.offsetHSL(0,0,grain);colors.push(color.r,color.g,color.b);
  }
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const skull=new T.Mesh(geometry,fur);skull.name='continuous-sculpted-skull';skull.castShadow=skull.receiveShadow=true;head.add(skull);
  function patch(cx,cy,rx,ry,m,offset,name){const points=[cx,cy,depth(cx,cy)+offset],indices=[],n=64,rings=12;
    for(let ring=1;ring<=rings;ring++)for(let i=0;i<n;i++){const a=i*Math.PI*2/n,x=cx+Math.cos(a)*rx*ring/rings,y=cy+Math.sin(a)*ry*ring/rings;points.push(x,y,depth(x,y)+offset);const k=1+(ring-1)*n+i,next=1+(ring-1)*n+(i+1)%n;if(ring===1)indices.push(0,k,next);else indices.push(k-n,k,next,k-n,next,next-n);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));const uv=[];for(let j=0;j<points.length;j+=3)uv.push((points[j]-cx)/rx*.5+.5,(points[j+1]-cy)/ry*.5+.5);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const o=new T.Mesh(g,m);o.name=name;head.add(o);return o;
  }
  const irisCanvas=document.createElement('canvas');irisCanvas.width=irisCanvas.height=512;const ic=irisCanvas.getContext('2d');
  const gradient=ic.createRadialGradient(256,256,40,256,256,250);gradient.addColorStop(0,'#b99a41');gradient.addColorStop(.4,'#619d61');gradient.addColorStop(.85,'#36745b');gradient.addColorStop(1,'#203e37');ic.fillStyle=gradient;ic.fillRect(0,0,512,512);
  for(let i=0;i<1100;i++){const a=random()*Math.PI*2,r=55+random()*155;ic.strokeStyle=i%3?'rgba(13,47,31,.25)':'rgba(224,196,114,.3)';ic.lineWidth=.5+random();ic.beginPath();ic.moveTo(256+Math.cos(a)*r,256+Math.sin(a)*r);ic.lineTo(256+Math.cos(a+.003)*(r+20+random()*45),256+Math.sin(a+.003)*(r+20+random()*45));ic.stroke();}
  const irisTexture=new T.CanvasTexture(irisCanvas);irisTexture.colorSpace=T.SRGBColorSpace;eyeGreen.map=irisTexture;eyeGreen.color.set('#ffffff');eyeGreen.clearcoat=1;eyeGreen.clearcoatRoughness=.12;
  for(const side of[-1,1]){
    const x=side*.195,y=.065;patch(x,y,.128,.156,ink,.004,'eye-rim');patch(x,y,.116,.144,white,.008,'eye-white');
    patch(x-side*.007,y-.005,.076,.102,eyeGreen,.012,'iris');
    patch(x-side*.007,y-.006,.029,.076,ink,.020,'cat-pupil');patch(x-.028,y+.042,.021,.027,white,.025,'catchlight');patch(x+.025,y-.05,.008,.010,white,.026,'catchlight');
    const lid=[];for(let i=0;i<=20;i++){const a=i*Math.PI/20,xx=x+Math.cos(a)*.122,yy=y+Math.sin(a)*.148;lid.push([xx,yy,depth(xx,yy)+.014]);}line(head,lid,.013,orange,'sculpted-eyelid');
    const brow=[];for(let i=0;i<=12;i++){const xx=x-.10+i/12*.20,yy=.275+.025*Math.sin(i/12*Math.PI);brow.push([xx,yy,depth(xx,yy)+.008]);}line(head,brow,.020,orange,'brow');
    // Curved hollow ears with rounded rims and recessed pink interiors.
    const earGeo=new T.SphereGeometry(1,48,32),ep=earGeo.attributes.position;for(let i=0;i<ep.count;i++){const yy=ep.getY(i),t=(yy+1)/2;ep.setX(i,ep.getX(i)*(1-.65*t));}earGeo.computeVertexNormals();
    const ear=new T.Mesh(earGeo,orange);ear.position.set(side*.355,.405,-.045);ear.scale.set(.195,.255,.115);ear.rotation.z=-side*.21;ear.castShadow=true;head.add(ear);
    const inner=ear.clone();inner.geometry=earGeo.clone();inner.material=pink;inner.position.z=.032;inner.scale.set(.133,.183,.040);head.add(inner);
    for(let i=0;i<5;i++){const xx=side*(.29+i*.020),yy=.31+i*.032;line(head,[[xx,yy,.078],[xx-side*.012,yy+.055,.075],[xx-side*.02,yy+.08,.055]],.0012,cream,'ear-fur');}
    // Tapered whiskers anchored in the light muzzle surface.
    for(let i=0;i<3;i++){const yy=-.16-i*.033;line(head,[[side*.205,yy,depth(side*.205,yy)+.009],[side*.40,yy+.015,.39],[side*(.64+i*.025),yy+.07-i*.045,.35]],.0022,cream,'whisker');}
    for(let i=0;i<6;i++){const xx=side*(.12+(i%3)*.036),yy=-.16-Math.floor(i/3)*.035;ell(head,xx,yy,depth(xx,yy)+.006,.003,.003,.002,lip,'whisker-root');}
  }
  patch(0,-.235,.11,.043,mouth,.006,'smile-opening');patch(.025,-.256,.047,.014,tongue,.010,'tongue');
  for(const side of[-1,1])line(head,[[0,-.16,depth(0,-.16)+.009],[side*.055,-.202,depth(side*.055,-.202)+.012],[side*.115,-.185,depth(side*.115,-.185)+.010]],.005,lip,'smile-crease');
  const ng=new T.SphereGeometry(1,48,32),np=ng.attributes.position;for(let i=0;i<np.count;i++)np.setX(i,np.getX(i)*(.65+.35*(np.getY(i)+1)/2));ng.computeVertexNormals();const nm=new T.Mesh(ng,nose);nm.position.set(0,-.116,depth(0,-.116)+.020);nm.scale.set(.071,.046,.042);head.add(nm);
  ell(head,-.019,-.10,depth(0,-.116)+.056,.015,.007,.003,white,'nose-glint');
  // Individually instanced short fur at the silhouette, one draw call for the whole coat.
  const strands=new T.InstancedMesh(new T.ConeGeometry(.0014,.014,3),mat('#ffffff',.9),6500),dummy=new T.Object3D(),up=new T.Vector3(0,1,0),normal=new T.Vector3();
  let count=0;for(let attempt=0;attempt<18000&&count<6500;attempt++){
    const v=random()*2-1,a=random()*Math.PI*2,ring=Math.sqrt(1-v*v),x=w*ring*Math.sin(a),y=h*v,z=d*ring*Math.cos(a),front=Math.max(0,z/d);
    if(z>.1&&Math.abs(x)<.37&&y<.29)continue;
    normal.set(x/(w*w),y/(h*h),z/(d*d)).normalize();dummy.position.set(x,y,z+bumpAt(x,y)*Math.min(1,front*3)).addScaledVector(normal,.003);dummy.quaternion.setFromUnitVectors(up,normal);dummy.scale.setScalar(.6+random()*.8);dummy.updateMatrix();strands.setMatrixAt(count,dummy.matrix);
    color.copy(ginger);const angle=Math.atan2(x,z),marked=y>.20&&z>0&&Math.abs(Math.sin(x*27+y*3))<.27||Math.abs(angle)>.85&&Math.abs(Math.sin(y*27+Math.cos(angle*2)*.7))<.27&&y>-.2;
    if(marked)color.lerp(stripe,.7);color.offsetHSL(0,0,(random()-.5)*.06);strands.setColorAt(count,color);count++;
  }strands.count=count;strands.name='instanced-short-fur';head.add(strands);
  head.userData.faceStyle='premium-cat-v1';head.userData.features=['continuous-skull','fur-bump','tabby-vertex-color','radial-irises','hollow-ears','tapered-whiskers','instanced-short-fur'];
  return{...base,head};
}

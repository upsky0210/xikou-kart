import {buildToonRacer} from './toon-racer.js?build=20261031-wildlife3';
import {buildStorybookRacer,STORYBOOK_SPECIES} from './storybook-racers.js?build=20261031-wildlife3';

// New anatomical surfaces, not denser copies of the previous sphere assembly.
export const SCULPTS=Object.freeze({
 bunny:{w:.385,h:.39,d:.335,cheek:.17,muzzle:.068,mw:.26,mh:.16,my:-.15,ex:.166,ey:.065,iris:'#996293',nose:'#df929b',ears:'long'},
 hamster:{w:.445,h:.355,d:.34,cheek:.27,muzzle:.052,mw:.35,mh:.16,my:-.13,ex:.205,ey:.074,iris:'#9b743d',nose:'#df8b91',ears:'round'},
 beagle:{w:.385,h:.425,d:.345,cheek:.11,muzzle:.205,mw:.25,mh:.17,my:-.15,ex:.166,ey:.105,iris:'#a36f38',nose:'#30282a',ears:'droop'},
 macaque:{w:.345,h:.40,d:.33,cheek:.14,muzzle:.083,mw:.24,mh:.16,my:-.17,ex:.155,ey:.065,iris:'#936438',nose:'#644231',ears:'wide'},
 horse:{w:.315,h:.465,d:.325,cheek:.08,muzzle:.265,mw:.225,mh:.235,my:-.18,ex:.136,ey:.14,iris:'#728f9e',nose:'#846046',ears:'upright'},
 sheep:{w:.285,h:.395,d:.32,cheek:.06,muzzle:.105,mw:.195,mh:.20,my:-.16,ex:.122,ey:.07,iris:'#6d9eaa',nose:'#75574b',ears:'side'},
 boar:{w:.45,h:.365,d:.35,cheek:.12,muzzle:.195,mw:.245,mh:.16,my:-.115,ex:.19,ey:.105,iris:'#9f8244',nose:'#d39799',ears:'point'},
});
export function buildSculptedRacer(T,p){
 if(STORYBOOK_SPECIES.includes(p.id))return buildStorybookRacer(T,p);
 const a=SCULPTS[p.id];if(!a)throw Error(`No sculpt for ${p.id}`);
 const base=buildToonRacer(T,p),{driver}=base,old=base.head;old.removeFromParent();old.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
 const head=new T.Group();head.name=`sculpted-${p.id}-head`;head.position.set(0,1.41,-.12);driver.add(head);
 let seed=12937+Number(p.number)*513;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),clamp=x=>Math.max(0,Math.min(1,x));
 const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const c=cv.getContext('2d');c.fillStyle='#888';c.fillRect(0,0,1024,512);
 for(let i=0;i<32000;i++){const x=rand()*1024,y=rand()*512,v=65+Math.floor(rand()*120);c.strokeStyle=`rgb(${v},${v},${v})`;c.lineWidth=.45+rand()*.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+(rand()-.5)*2,y+2+rand()*4);c.stroke();}
 const bump=new T.CanvasTexture(cv),mat=(color,roughness=.6,extra={})=>new T.MeshPhysicalMaterial({color,roughness,...extra});
 const fur=mat('#ffffff',.69,{vertexColors:true,bumpMap:bump,bumpScale:.007}),solid=mat(p.fur,.65,{bumpMap:bump,bumpScale:.006}),light=mat(p.light,.65,{bumpMap:bump,bumpScale:.004}),dark=mat(p.dark,.64,{bumpMap:bump,bumpScale:.005}),pink=mat('#dea0a7',.55),ink=mat('#27222b',.28),white=mat('#fff9ed',.23),nose=mat(a.nose,.30,{clearcoat:.3}),mouth=mat('#47252e',.58),tongue=mat('#dd8592',.46);
 const width=y=>1+a.cheek*Math.exp(-(((y+.13)/.19)**2))-.065*clamp((y-.13)/.25);
 const project=(x,y)=>a.muzzle*Math.exp(-((x/a.mw)**4+((y-a.my)/a.mh)**4));
 const depth=(x,y)=>a.d*Math.sqrt(Math.max(.008,1-(x/(a.w*width(y)))**2-(y/a.h)**2))+project(x,y);
 function ell(parent,x,y,z,sx,sy,sz,m,name){const o=new T.Mesh(new T.SphereGeometry(1,48,32),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function stroke(points,r,m,name,taper=false){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),g=new T.TubeGeometry(curve,24,r,8,false);if(taper){const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const t=Math.floor(i/9)/24,center=curve.getPointAt(t),f=.06+.94*(1-t);pos.setXYZ(i,center.x+(pos.getX(i)-center.x)*f,center.y+(pos.getY(i)-center.y)*f,center.z+(pos.getZ(i)-center.z)*f);}g.computeVertexNormals();}const o=new T.Mesh(g,m);o.name=name;o.castShadow=true;head.add(o);return o;}
 const baseColor=new T.Color(p.id==='sheep'?'#d7bda3':p.fur),pale=new T.Color(p.light),brown=new T.Color(p.dark),color=new T.Color();
 function coatColor(x,y,z){color.copy(baseColor);const front=clamp(z/a.d),cheeks=Math.exp(-((x/(a.w*.88))**6+((y+.18)/.19)**6))*front;
  if(p.id==='macaque'){const mask=clamp((1-(x/.30)**2-((y+.025)/.31)**2)*6)*front;color.lerp(pale,mask);}
  else if(p.id==='beagle'){const blaze=Math.exp(-((x/.062)**4))*clamp((y+.08)/.14)*front;color.lerp(pale,Math.max(blaze,cheeks));if(z<-.06&&y>.12)color.lerp(brown,.45);}
  else if(p.id==='horse'){const blaze=Math.exp(-((x/.046)**4))*front;color.lerp(pale,blaze*.9);if(y<-.16&&front>.15)color.lerp(brown,clamp((-y-.16)/.18)*.55);}
  else if(p.id==='boar'){color.lerp(brown,clamp((y-.19)/.13)*.3);}
  else if(p.id==='sheep'){color.lerp(pale,cheeks*.35);}
  else color.lerp(pale,Math.max(cheeks,clamp((-y-.22)/.10)*front));
  color.offsetHSL(0,0,(rand()-.5)*.028);return color;
 }
 const geometry=new T.SphereGeometry(1,128,80),pos=geometry.attributes.position,colors=[];
 for(let i=0;i<pos.count;i++){const y=pos.getY(i)*a.h,x=pos.getX(i)*a.w*width(y),z=pos.getZ(i)*a.d,front=clamp(z/a.d);pos.setXYZ(i,x,y,z+project(x,y)*Math.min(1,front*3));const col=coatColor(x,y,z);colors.push(col.r,col.g,col.b);}
 geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const skull=new T.Mesh(geometry,fur);skull.name='continuous-sculpted-skull';skull.castShadow=skull.receiveShadow=true;head.add(skull);
 function patch(cx,cy,rx,ry,m,offset,name){const points=[cx,cy,depth(cx,cy)+offset],uv=[.5,.5],indices=[],n=48,rings=10;for(let r=1;r<=rings;r++)for(let i=0;i<n;i++){const angle=i*Math.PI*2/n,x=cx+Math.cos(angle)*rx*r/rings,y=cy+Math.sin(angle)*ry*r/rings;points.push(x,y,depth(x,y)+offset);uv.push((x-cx)/rx*.5+.5,(y-cy)/ry*.5+.5);const k=1+(r-1)*n+i,next=1+(r-1)*n+(i+1)%n;if(r===1)indices.push(0,k,next);else indices.push(k-n,k,next,k-n,next,next-n);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const o=new T.Mesh(g,m);o.name=name;head.add(o);return o;}
 const icv=document.createElement('canvas');icv.width=icv.height=512;const ic=icv.getContext('2d'),gradient=ic.createRadialGradient(256,256,30,256,256,254);gradient.addColorStop(0,'#b29b55');gradient.addColorStop(.45,a.iris);gradient.addColorStop(.84,a.iris);gradient.addColorStop(1,'#262a27');ic.fillStyle=gradient;ic.fillRect(0,0,512,512);
 for(let i=0;i<1100;i++){const angle=rand()*Math.PI*2,r=50+rand()*180;ic.strokeStyle=i%3?'rgba(20,25,22,.26)':'rgba(245,217,150,.28)';ic.lineWidth=.5+rand();ic.beginPath();ic.moveTo(256+Math.cos(angle)*r,256+Math.sin(angle)*r);ic.lineTo(256+Math.cos(angle+.002)*(r+24),256+Math.sin(angle+.002)*(r+24));ic.stroke();}
 const irisTexture=new T.CanvasTexture(icv);irisTexture.colorSpace=T.SRGBColorSpace;const iris=mat('#ffffff',.23,{map:irisTexture,clearcoat:1,clearcoatRoughness:.12});
 const eyeW=p.id==='horse'||p.id==='sheep'?.087:.112,eyeH=p.id==='hamster'?.122:.137;
 for(const side of[-1,1]){const x=side*a.ex,y=a.ey;patch(x,y,eyeW+.009,eyeH+.01,ink,.004,'eye-rim');patch(x,y,eyeW,eyeH,white,.008,'eye-white');patch(x-side*.008,y-.006,eyeW*.67,eyeH*.72,iris,.012,'iris');patch(x-side*.008,y-.007,eyeW*.38,eyeH*.53,ink,.019,'pupil');patch(x-.025,y+.035,.018,.023,white,.024,'catchlight');
  const lid=[],brow=[];for(let i=0;i<=18;i++){const angle=Math.PI*i/18,xx=x+Math.cos(angle)*(eyeW+.005),yy=y+Math.sin(angle)*(eyeH+.005);lid.push([xx,yy,depth(xx,yy)+.016]);}stroke(lid,.011,solid,'sculpted-eyelid');for(let i=0;i<=12;i++){const xx=x-eyeW*.8+i/12*eyeW*1.6,yy=y+eyeH+.035+.018*Math.sin(i/12*Math.PI);brow.push([xx,yy,depth(xx,yy)+.01]);}stroke(brow,.018,p.id==='sheep'?light:solid,'sculpted-brow');
 }
 const smileY=p.id==='horse'?-.31:p.id==='boar'?-.26:-.235;
 patch(0,smileY,p.id==='hamster'?.11:.105,.035,mouth,.007,'smile-opening');patch(.024,smileY-.02,.045,.014,tongue,.011,'tongue');
 stroke([[-.10,smileY+.024,depth(-.10,smileY+.024)+.010],[-.055,smileY-.023,depth(-.055,smileY-.023)+.010],[0,smileY-.034,depth(0,smileY-.034)+.010],[.055,smileY-.023,depth(.055,smileY-.023)+.010],[.10,smileY+.024,depth(.10,smileY+.024)+.010]],.004,nose,'smile-crease');
 if(p.id==='boar'){
  patch(0,-.115,.19,.097,nose,.014,'sculpted-snout-plate');
  for(const side of[-1,1]){patch(side*.075,-.115,.023,.030,ink,.021,'nostril');stroke([[side*.235,-.235,depth(side*.235,-.235)],[side*.30,-.15,.50],[side*.28,-.055,.53]],.038,white,'sculpted-tusk',true);}
 }else if(p.id==='horse'){
  for(const side of[-1,1])patch(side*.096,-.205,.034,.019,ink,.015,'nostril');
 }else{
  const ny=p.id==='beagle'?-.092:-.105,nw=p.id==='beagle'?.093:p.id==='macaque'?.047:.057;
  const ng=new T.SphereGeometry(1,48,32),np=ng.attributes.position;for(let i=0;i<np.count;i++)np.setX(i,np.getX(i)*(.70+.30*(np.getY(i)+1)/2));ng.computeVertexNormals();const sn=new T.Mesh(ng,nose);sn.position.set(0,ny,depth(0,ny)+.019);sn.scale.set(nw,.042,p.id==='beagle'?.05:.032);sn.name='sculpted-nose';head.add(sn);
  const lipPoints=[[0,ny-.035,depth(0,ny-.035)+.01],[0,smileY+.055,depth(0,smileY+.055)+.014]];stroke(lipPoints,.004,nose,'philtrum');
 }
 if(['hamster','bunny'].includes(p.id))for(const side of[-1,1])ell(head,side*.029,smileY+.012,depth(side*.029,smileY+.012)+.031,.025,.041,.017,white,'front-tooth');
 // Each ear is a shaped continuous surface with a recessed inner skin.
 function ear(side,x,y,z,sx,sy,sz,rotation,kind){const g=new T.SphereGeometry(1,64,40),v=g.attributes.position;for(let i=0;i<v.count;i++){let xx=v.getX(i),yy=v.getY(i),zz=v.getZ(i);if(kind==='long'){xx*=1-.28*Math.max(0,yy);zz+=.18*Math.max(0,yy)**3;}if(kind==='droop'){xx*=.82-.22*yy;zz+=.14*(1-yy*yy);}if(kind==='point')xx*=1-.65*(yy+1)/2;v.setXYZ(i,xx,yy,zz);}g.computeVertexNormals();const o=new T.Mesh(g,kind==='droop'?dark:solid);o.position.set(side*x,y,z);o.scale.set(sx,sy,sz);o.rotation.z=side*rotation;o.name=`sculpted-${kind}-ear`;o.castShadow=true;head.add(o);const inner=o.clone();inner.geometry=g.clone();inner.material=pink;inner.position.z+=sz*.70;inner.scale.multiply(new T.Vector3(.62,.76,.32));inner.name='recessed-inner-ear';head.add(inner);return o;}
 for(const side of[-1,1]){
  if(a.ears==='long')ear(side,.20,.42,-.04,.115,.29,.09,-.16,'long');
  if(a.ears==='round')ear(side,.365,.275,-.06,.135,.13,.085,-.14,'round');
  if(a.ears==='droop')ear(side,.395,-.06,-.025,.185,.35,.12,.14,'droop');
  if(a.ears==='wide')ear(side,.37,.02,-.035,.18,.195,.105,.0,'wide');
  if(a.ears==='upright')ear(side,.205,.385,-.05,.095,.20,.08,-.08,'upright');
  if(a.ears==='side')ear(side,.385,.02,-.025,.205,.080,.095,.15,'side');
  if(a.ears==='point')ear(side,.345,.265,-.045,.16,.20,.09,-.46,'point');
 }
 if(p.id==='horse'){
  stroke([[0,.37,-.20],[0,.25,-.365],[0,.04,-.415],[0,-.22,-.36]],.080,dark,'sculpted-mane');
  for(let i=-1;i<=1;i++)stroke([[i*.055,.30,.07],[i*.065+.035,.43,.18],[i*.05+.06,.33,.25]],.045,dark,'forelock',true);
 }
 if(p.id==='macaque')for(let i=-1;i<=1;i++)stroke([[i*.055,.32,-.02],[i*.055,.43,.04],[i*.04+.045,.38,.12]],.038,dark,'crown-tuft',true);
 if(p.id==='boar')for(let i=0;i<5;i++)stroke([[0,.30-i*.045,-.04-i*.055],[0,.46-i*.035,-.07-i*.060],[0,.40-i*.040,-.12-i*.060]],.032,dark,'bristle-crest',true);
 if(p.id==='sheep'){
  // One sculpted fleece cap with layered curls, not the old ring of spheres.
  const vertices=[],uv=[],indices=[],n=96,rings=48;
  for(let row=0;row<=rings;row++)for(let i=0;i<=n;i++){const phi=i/n*Math.PI*2,front=Math.max(0,Math.sin(phi)),theta=row/rings*(2.18-front*1.17),ripple=.018*Math.sin(theta*27+Math.sin(phi*9))*.5+.012*Math.cos(phi*23+theta*9),radius=1+ripple/.4;vertices.push(Math.cos(phi)*Math.sin(theta)*.43*radius,.04+Math.cos(theta)*.43*radius,Math.sin(phi)*Math.sin(theta)*.355*radius-.035);uv.push(i/n,row/rings);if(row&&i){const k=row*(n+1)+i;indices.push(k-n-2,k,k-1,k-n-2,k-n-1,k);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const cap=new T.Mesh(g,light);cap.name='sculpted-fleece-cap';cap.castShadow=true;head.add(cap);
  for(const side of[-1,1]){const bow=ell(head,-.25+side*.075,.37,.24,.10,.062,.045,mat(p.accent,.45),'bow-loop');bow.rotation.z=side*.4;}ell(head,-.25,.37,.275,.041,.041,.03,pink,'bow-knot');
 }
 // A single instanced coat follows the new skull surface and preserves markings.
 const strands=new T.InstancedMesh(new T.ConeGeometry(.0014,p.id==='boar'?.022:.013,3),mat('#ffffff',.9),4800),dummy=new T.Object3D(),up=new T.Vector3(0,1,0),normal=new T.Vector3();let count=0;
 for(let attempt=0;attempt<16000&&count<4800;attempt++){const yy=rand()*2-1,angle=rand()*Math.PI*2,r=Math.sqrt(1-yy*yy),y=yy*a.h,x=Math.cos(angle)*r*a.w*width(y),z=Math.sin(angle)*r*a.d,front=clamp(z/a.d);if(z>.02&&Math.abs(x)<a.w*.9&&y<a.h*.82)continue;if(p.id==='sheep'&&y>.12)continue;normal.set(x/(a.w*a.w),y/(a.h*a.h),z/(a.d*a.d)).normalize();dummy.position.set(x,y,z+project(x,y)*Math.min(1,front*3)).addScaledVector(normal,.003);dummy.quaternion.setFromUnitVectors(up,normal);dummy.scale.setScalar(.6+rand()*.8);dummy.updateMatrix();strands.setMatrixAt(count,dummy.matrix);strands.setColorAt(count,coatColor(x,y,z));count++;}
 strands.count=count;strands.name='instanced-short-fur';head.add(strands);
 head.userData.faceStyle=`premium-${p.id}-v2`;head.userData.sculptRevision=2;head.userData.anatomy={...a};head.userData.features=['continuous-skull','sculpted-muzzle','surface-following-eyes','radial-irises',`sculpted-${a.ears}-ears`,'instanced-short-fur'];
 return{...base,head};
}

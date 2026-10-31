import { buildSculptedRacer } from './sculpted-racers.js?build=20261031-racing1';
import { buildPremiumCat } from './premium-cat.js?build=20261031-racing1';
import { buildToonRacer } from './toon-racer.js?build=20261031-racing1';
import { makeAnimalFace } from './animal-face.js?build=20261031-racing1';
import { getRacer } from './racer-catalog.js?build=20261031-racing1';
import { addSculptedFace } from './sculpted-face.js?build=20261031-racing1';
export function buildAnimal(T,id,options={}){
  const profile=getRacer(id);
  if(!options.faceStyle||options.faceStyle==='premium')return profile.id==='cat'?buildPremiumCat(T,profile):buildSculptedRacer(T,profile);
  if(options.faceStyle==='toon')return buildToonRacer(T,profile);
  const p=getRacer(id),driver=new T.Group(),head=new T.Group();driver.name=`racer-${p.id}`;head.name='animal-head';head.position.set(0,1.49,-.12);driver.add(head);driver.userData.racer=p.id;
  const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.7});
  const fur=mat(p.fur),light=mat(p.light),dark=mat(p.dark),suit=mat(p.suit),white=mat('#fffaf0'),ink=mat('#292a30'),pink=mat('#edb0a4'),accent=mat(p.accent);
  function ell(x,y,z,sx,sy,sz,m,parent=head){const o=new T.Mesh(new T.SphereGeometry(1,20,14),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
  function rod(a,b,r,m,parent=driver){const va=new T.Vector3(...a),vb=new T.Vector3(...b),o=new T.Mesh(new T.CylinderGeometry(r,r,va.distanceTo(vb),10),m);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());parent.add(o);return o;}
  function ear(x,y,z,sx,sy,sz,m=fur){return ell(x,y,z,sx,sy,sz,m);}
  ell(0,.96,-.14,.25,.30,.20,suit,driver);ell(0,1.02,.048,.115,.20,.026,light,driver);
  for(const side of[-1,1]){rod([side*.15,.74,-.12],[side*.16,.68,.33],.085,suit);ell(side*.16,.66,.39,.11,.075,.17,accent,driver);rod([side*.20,1.12,-.07],[side*.31,.96,.13],.076,suit);rod([side*.31,.96,.13],[side*.16,1.0,.31],.069,suit);ell(side*.16,1,.31,.083,.075,.078,white,driver);}
  const sculpted=(options.faceStyle??'sculpted')==='sculpted'&&['cat','beagle'].includes(p.id);
  const faceMaterial=new T.MeshStandardMaterial({map:makeAnimalFace(T,p,sculpted),roughness:.85});
  const surface=ell(0,0,0,p.id==='horse'?.35:.43,p.id==='horse'?.46:.40,.36,faceMaterial);surface.name='animal-face';
  if(sculpted){surface.geometry.dispose();surface.geometry=new T.SphereGeometry(1,64,48);addSculptedFace(T,head,p,surface);}
  if(p.id==='cat'||p.id==='boar')for(const side of[-1,1]){const o=new T.Mesh(new T.ConeGeometry(.18,.32,3),fur);o.position.set(side*.31,.35,-.04);o.rotation.z=side*-.25;head.add(o);const inner=new T.Mesh(new T.ConeGeometry(.115,.23,3),pink);inner.position.set(side*.31,.35,.045);inner.rotation.z=side*-.25;head.add(inner);}
  if(['meerkat','hamster','macaque'].includes(p.id))for(const side of[-1,1]){ear(side*.37,.22,-.04,.15,.16,.09);ear(side*.38,.23,.025,.10,.105,.04,pink);}
  if(p.id==='beagle')for(const side of[-1,1]){const e=ear(side*.40,-.04,-.02,.16,.31,.10,dark);e.rotation.z=side*.12;ear(side*.40,-.08,.055,.10,.23,.045,fur);}
  if(p.id==='horse'){
    for(const side of[-1,1]){ear(side*.23,.41,-.04,.10,.23,.09);ear(side*.23,.43,.032,.055,.15,.03,pink);}
    for(let i=0;i<5;i++)ell((i-2)*.065,.35-i%2*.035,.05,.09,.16,.08,dark);
    for(let i=0;i<5;i++)ell(0,.26-i*.12,-.32,.12,.12,.10,dark);

  }
  if(p.id==='sheep'){
    for(let i=0;i<12;i++){const a=i*Math.PI*2/12;ell(Math.cos(a)*.33,.10+Math.sin(a)*.27,-.01,.15,.15,.29,light);}
    for(const side of[-1,1]){const e=ear(side*.43,.06,0,.20,.09,.10);e.rotation.z=side*.20;ear(side*.47,.065,.075,.12,.045,.035,pink);}
    for(const side of[-1,1]){const bow=ell(-.29+side*.09,.38,.17,.11,.075,.05,accent);bow.rotation.z=side*.4;}ell(-.29,.38,.21,.055,.055,.045,pink);
  }
  if(p.id==='boar'){
    for(const side of[-1,1]){const tusk=new T.Mesh(new T.ConeGeometry(.045,.15,12),white);tusk.position.set(side*.23,-.20,.27);tusk.rotation.z=side*-.3;head.add(tusk);}
    for(let i=0;i<3;i++)ell((i-1)*.09,.36,-.11,.075,.15,.09,dark);
  }
  if(p.id==='cat'){

    const tail=[[0,.73,-.38],[.36,.70,-.68],[.59,.89,-.72],[.55,1.10,-.70]];for(let i=1;i<tail.length;i++)rod(tail[i-1],tail[i],.065,i%2?fur:dark);
  }
  if(p.id==='meerkat')rod([0,.72,-.38],[.48,.54,-.83],.065,fur);
  if(p.id==='beagle'){rod([0,.71,-.40],[.42,.89,-.71],.055,fur);ell(.44,.93,-.72,.06,.10,.055,white,driver);}
  if(p.id==='macaque'){const tail=new T.Mesh(new T.TorusGeometry(.19,.045,8,18,Math.PI*1.65),fur);tail.position.set(.40,.68,-.62);driver.add(tail);}
  if(p.id==='horse')ell(.25,.63,-.71,.09,.25,.10,dark,driver);
  if(p.id==='boar'){const tail=new T.Mesh(new T.TorusGeometry(.09,.033,8,16,Math.PI*1.8),pink);tail.position.set(.38,.73,-.64);driver.add(tail);}
  // A soft racing band leaves each animal's ears and face visible.
  if(p.id!=='sheep'){const band=new T.Mesh(new T.TorusGeometry(.365,.035,8,28),accent);band.rotation.x=Math.PI/2;band.position.set(0,.245,-.035);head.add(band);}
  if(p.id==='hamster')for(const side of[-1,1]){const g=new T.Mesh(new T.TorusGeometry(.085,.018,8,16),accent);g.position.set(side*.105,.29,.27);head.add(g);ell(side*.105,.29,.263,.071,.071,.020,dark);}
  return{driver,head,profile:p};
}

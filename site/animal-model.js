import { getRacer } from './racer-catalog.js?build=20261025-animals2';
export function buildAnimal(T,id){
  const p=getRacer(id),driver=new T.Group(),head=new T.Group();driver.name=`racer-${p.id}`;head.name='animal-head';head.position.set(0,1.49,-.12);driver.add(head);driver.userData.racer=p.id;
  const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.7});
  const fur=mat(p.fur),light=mat(p.light),dark=mat(p.dark),suit=mat(p.suit),white=mat('#fffaf0'),ink=mat('#292a30'),pink=mat('#edb0a4'),accent=mat(p.accent);
  function ell(x,y,z,sx,sy,sz,m,parent=head){const o=new T.Mesh(new T.SphereGeometry(1,20,14),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
  function rod(a,b,r,m,parent=driver){const va=new T.Vector3(...a),vb=new T.Vector3(...b),o=new T.Mesh(new T.CylinderGeometry(r,r,va.distanceTo(vb),10),m);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());parent.add(o);return o;}
  function ear(x,y,z,sx,sy,sz,m=fur){return ell(x,y,z,sx,sy,sz,m);}
  ell(0,.96,-.14,.25,.30,.20,suit,driver);ell(0,1.02,.048,.115,.20,.026,light,driver);
  for(const side of[-1,1]){rod([side*.15,.74,-.12],[side*.16,.68,.33],.085,suit);ell(side*.16,.66,.39,.11,.075,.17,accent,driver);rod([side*.20,1.12,-.07],[side*.31,.96,.13],.076,suit);rod([side*.31,.96,.13],[side*.16,1.0,.31],.069,suit);ell(side*.16,1,.31,.083,.075,.078,white,driver);}
  ell(0,0,0,p.id==='horse'?.35:.43,p.id==='horse'?.46:.40,.36,fur);
  if(p.id==='cat'||p.id==='boar')for(const side of[-1,1]){const o=new T.Mesh(new T.ConeGeometry(.18,.32,3),fur);o.position.set(side*.31,.35,-.04);o.rotation.z=side*-.25;head.add(o);const inner=new T.Mesh(new T.ConeGeometry(.115,.23,3),pink);inner.position.set(side*.31,.35,.045);inner.rotation.z=side*-.25;head.add(inner);}
  if(['meerkat','hamster','macaque'].includes(p.id))for(const side of[-1,1]){ear(side*.37,.22,-.04,.15,.16,.09);ear(side*.38,.23,.025,.10,.105,.04,pink);}
  if(p.id==='beagle')for(const side of[-1,1]){const e=ear(side*.40,-.04,-.02,.16,.31,.10,dark);e.rotation.z=side*.12;ear(side*.40,-.08,.055,.10,.23,.045,fur);}
  if(p.id==='horse'){
    for(const side of[-1,1]){ear(side*.23,.41,-.04,.10,.23,.09);ear(side*.23,.43,.032,.055,.15,.03,pink);}
    for(let i=0;i<5;i++)ell((i-2)*.065,.35-i%2*.035,.05,.09,.16,.08,dark);
    for(let i=0;i<5;i++)ell(0,.26-i*.12,-.32,.12,.12,.10,dark);
    ell(0,.09,.33,.085,.20,.04,light);
  }
  if(p.id==='sheep'){
    for(let i=0;i<12;i++){const a=i*Math.PI*2/12;ell(Math.cos(a)*.33,.10+Math.sin(a)*.27,-.01,.15,.15,.29,light);}
    for(const side of[-1,1]){const e=ear(side*.43,.06,0,.20,.09,.10);e.rotation.z=side*.20;ear(side*.47,.065,.075,.12,.045,.035,pink);}
    for(const side of[-1,1]){const bow=ell(-.29+side*.09,.38,.17,.11,.075,.05,accent);bow.rotation.z=side*.4;}ell(-.29,.38,.21,.055,.055,.045,pink);
  }
  if(p.id==='macaque'){ell(0,-.055,.215,.33,.30,.16,light);ell(-.16,.12,.23,.17,.17,.12,light);ell(.16,.12,.23,.17,.17,.12,light);}
  if(p.id==='meerkat')for(const side of[-1,1])ell(side*.18,.055,.285,.17,.19,.07,dark);
  if(p.id==='beagle'){ell(0,.10,.32,.10,.28,.045,light);ell(-.13,-.19,.28,.18,.13,.15,light);ell(.13,-.19,.28,.18,.13,.15,light);}
  else if(p.id==='boar'){
    ell(0,-.15,.34,.23,.16,.14,pink);for(const side of[-1,1]){ell(side*.085,-.13,.475,.035,.045,.018,dark);const tusk=new T.Mesh(new T.ConeGeometry(.055,.19,12),white);tusk.position.set(side*.24,-.17,.35);tusk.rotation.z=side*-.3;head.add(tusk);}
    for(let i=0;i<3;i++)ell((i-1)*.09,.36,-.11,.075,.15,.09,dark);
  }else if(p.id==='horse'){ell(0,-.23,.27,.25,.17,.18,light);for(const side of[-1,1])ell(side*.11,-.22,.43,.035,.024,.015,dark);}
  else if(p.id==='hamster'){for(const side of[-1,1])ell(side*.22,-.17,.27,.22,.18,.16,light);ell(0,-.30,.35,.07,.07,.04,white);}
  else{for(const side of[-1,1])ell(side*.11,-.18,.30,.16,.12,.13,light);}
  // Large glossy eyes with two small catchlights make the face readable at game scale.
  for(const side of[-1,1]){
    const x=side*.175,z=p.id==='macaque'?.343:.318;
    ell(x,.055,z,.15,.18,.065,white);ell(x,.043,z+.052,.114,.144,.042,dark);ell(x,.044,z+.084,.076,.107,.025,ink);
    ell(x-.032,.105,z+.108,.036,.043,.014,white);ell(x+.030,.005,z+.109,.016,.020,.010,white);
    ell(side*.30,-.12,.30,.065,.035,.025,pink);
  }
  if(p.id!=='boar'&&p.id!=='horse'){ell(0,-.14,.425,.065,.044,.04,p.id==='cat'?pink:ink);ell(0,-.23,.402,.055,.018,.018,dark);}
  if(p.id==='cat'){
    for(const side of[-1,1])for(let i=0;i<2;i++)ell(side*(.26+i*.045),.25-i*.075,.24,.028,.065,.022,dark);
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

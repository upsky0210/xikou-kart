import { buildAnimal } from './animal-model.js?build=20261026-lab1';
import { getRacer } from './racer-catalog.js?build=20261026-lab1';
// Original geometry, shared by the player and the non-colliding ghost.
export function buildKart(T,racerId='cat',options={}){
  const profile=getRacer(racerId);
  const car=new T.Group(),wheels=[];
  const mat=(color,metalness=0,roughness=.5)=>new T.MeshStandardMaterial({color,metalness,roughness});
  const paint=mat(profile.paint,.25,.32),cream=mat('#fff3d5'),teal=mat(profile.accent,.2,.35),dark=mat('#20343f'),rubber=mat('#20262c',0,.9),chrome=mat('#becbd0',.65,.3),suit=mat('#117d84');
  function mesh(geometry,material,x,y,z,parent=car){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);parent.add(o);return o;}
  function box(w,h,d,x,y,z,m,parent=car){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);}
  function ellipsoid(x,y,z,sx,sy,sz,m,parent=car){const o=mesh(new T.SphereGeometry(1,20,14),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o;}
  function rod(a,b,r,m,parent=car){const va=new T.Vector3(...a),vb=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(r,r,va.distanceTo(vb),10),m,0,0,0,parent);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return o;}
  box(.9,.12,1.65,0,.29,0,dark);const body=ellipsoid(0,.44,.38,.55,.24,.72,paint);
  for(const x of[-.5,.5]){ellipsoid(x,.43,-.20,.19,.20,.58,paint);box(.13,.025,.92,x,.62,-.18,teal);rod([x,.23,-.83],[x,.23,.9],.055,chrome);}
  ellipsoid(0,.43,.89,.58,.14,.23,teal);box(.15,.025,.61,0,.674,.54,cream);
  box(.82,.13,.2,0,.27,-.93,dark);rod([-.6,.28,.98],[.6,.28,.98],.065,chrome);
  for(const x of[-.37,.37]){rod([x,.37,-.69],[x,.82,-.75],.035,chrome);}box(.98,.10,.28,0,.84,-.76,teal);box(.32,.015,.28,0,.9,-.76,cream);
  // Padded seat, rear engine and exhaust.
  ellipsoid(0,.58,-.16,.32,.15,.36,dark);const seat=box(.59,.45,.17,0,.84,-.43,dark);seat.rotation.x=-.14;
  box(.27,.29,.36,.32,.48,-.65,chrome);for(let i=0;i<4;i++)box(.30,.035,.39,.32,.39+i*.07,-.65,dark);
  rod([-.33,.40,-.60],[-.33,.40,-1.05],.075,chrome);mesh(new T.CylinderGeometry(.055,.055,.02,12),dark,-.33,.4,-1.06).rotation.x=Math.PI/2;
  for(const x of[-.62,.62])for(const z of[-.62,.62]){
    const pivot=new T.Group();pivot.position.set(x,.29,z);car.add(pivot);
    const tire=mesh(new T.CylinderGeometry(.28,.28,.25,24),rubber,0,0,0,pivot);tire.rotation.z=Math.PI/2;
    const hub=mesh(new T.CylinderGeometry(.16,.16,.26,16),chrome,0,0,0,pivot);hub.rotation.z=Math.PI/2;
    for(let k=0;k<5;k++){const a=k*Math.PI*2/5;box(.015,.045,.20,Math.sign(x)*.14,Math.sin(a)*.08,Math.cos(a)*.08,teal,pivot);}
    wheels.push({pivot,tire,hub,front:z>0});
  }
  const {driver,head}=buildAnimal(T,profile.id,options);car.add(driver);
  const steeringWheel=mesh(new T.TorusGeometry(.20,.027,8,24),dark,0,1,.30);steeringWheel.rotation.x=-.6;
  // Procedural race number decal: no external image or model dependencies.
  const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');c.fillStyle='#fff3d5';c.beginPath();c.arc(64,64,57,0,7);c.fill();c.fillStyle='#164c54';c.font='900 72px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(profile.number,64,68);
  const texture=new T.CanvasTexture(cv);texture.colorSpace=T.SRGBColorSpace;const number=mesh(new T.PlaneGeometry(.37,.37),new T.MeshBasicMaterial({map:texture,transparent:true}),0,.67,.77);number.rotation.x=-Math.PI/2;
  return{car,body,wheels,steeringWheel,driver,head,profile};
}

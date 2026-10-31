import { ACTIVE_ROUTE } from './session-config.js?build=20261031-storybook5';
import { BOOST_PADS } from './effects-config.js?build=20261031-storybook5';
import { ROUTES, world, pointAt, distanceRect, distanceSegment } from './track-config.js?build=20261031-storybook5';
export function buildRaceDecor(T,scene,obstacles,walls,cameraBoxes){
  const group=new T.Group();scene.add(group);
  const arrow=new T.BufferGeometry();arrow.setAttribute('position',new T.Float32BufferAttribute([0,0,.6,-.4,0,-.3,.4,0,-.3],3));arrow.computeVertexNormals();
  for(const p of BOOST_PADS){
    const pad=new T.Mesh(new T.BoxGeometry(p.width,.025,p.length),new T.MeshBasicMaterial({color:'#e6a43f'}));pad.position.set(p.x,.112,p.z);pad.rotation.y=p.yaw;group.add(pad);
    for(const offset of[-1.1,0,1.1]){const m=new T.Mesh(arrow,new T.MeshBasicMaterial({color:'#fff4cb',side:T.DoubleSide}));m.position.set(p.x+Math.sin(p.yaw)*offset,.14,p.z+Math.cos(p.yaw)*offset);m.rotation.y=p.yaw;group.add(m);}
  }
  const poleMat=new T.MeshLambertMaterial({color:'#f4edda'}),flagMat=new T.MeshBasicMaterial({color:'#14918d',side:T.DoubleSide});
  for(let i=0;i<18;i++){
    const p=pointAt(ACTIVE_ROUTE.points,(i+.3)/18),q=pointAt(ACTIVE_ROUTE.points,(i+.3)/18+.001),[px,pz]=world(p),l=Math.hypot(q[0]-p[0],q[1]-p[1]);
    if(ACTIVE_ROUTE.id==='courtyard'&&p[1]<1500)continue;
    const x=px+(q[1]-p[1])/l*2.8,z=pz-(q[0]-p[0])/l*2.8;
    if(obstacles.some(b=>distanceRect(x,z,b)<.5)||walls.some(w=>distanceSegment(x,z,w)<.65))continue;
    const pole=new T.Mesh(new T.CylinderGeometry(.045,.045,1.8,5),poleMat);pole.position.set(x,.9,z);group.add(pole);
    const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(.7,-.25);shape.lineTo(0,-.5);shape.closePath();
    const flag=new T.Mesh(new T.ShapeGeometry(shape),flagMat);flag.position.set(x,1.8,z);flag.rotation.y=Math.atan2(q[0]-p[0],q[1]-p[1]);group.add(flag);
    obstacles.push({x1:x-.07,x2:x+.07,z1:z-.07,z2:z+.07,kind:'flag'});
    cameraBoxes.push(new T.Box3(new T.Vector3(x-.1,0,z-.1),new T.Vector3(x+.1,1.8,z+.1)));
  }
  return group;
}

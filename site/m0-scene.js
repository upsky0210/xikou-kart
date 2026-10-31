import { ROUTES, ISSUES, world, pointAt, auditRoute } from './track-config.js?build=20261031-wildlife3';
import { mergeGeometries } from './campus/vendor/three/examples/jsm/utils/BufferGeometryUtils.js?build=20261031-wildlife3';

export function initScene(api) {
  const { THREE: T, scene, camera, renderer, orbit, floors, rooms, raised } = api;
  const routeGroups = {};
  let routeId = 'field', showing = true, tour = false, progress = 0, last = performance.now(), hidden = false;
  let frames = [], lastMetrics = 0, start = performance.now(), quality = 'balanced';
  renderer.shadowMap.enabled = false;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.setSize(innerWidth, innerHeight);
  orbit.enableDamping = true; orbit.maxDistance = 260; orbit.minDistance = 4;
  orbit.maxPolarAngle = Math.PI * 0.49;
  // M0 freezes the inherited scene. Batch visible opaque meshes by material,
  // applying world transforms before moving them out of their original parents.
  // Transparent meshes retain their original sorting and scene hierarchy.
  scene.updateMatrixWorld(true);
  const bins=new Map();
  scene.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.material.transparent)return;
    for(let p=o;p;p=p.parent)if(!p.visible)return;
    const key=[o.material.uuid,o.castShadow,o.receiveShadow,o.renderOrder].join('|');
    if(!bins.has(key))bins.set(key,[]);bins.get(key).push(o);
  });
  let mergedMeshes=0,removedMeshes=0;
  for(const list of bins.values()){
    if(list.length<2)continue;
    const needColor=list.some(o=>o.geometry.attributes.color);
    const geometries=list.map(o=>{
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      for(const k of Object.keys(g.attributes))if(!['position','normal','uv','color'].includes(k))g.deleteAttribute(k);
      g.clearGroups();g.morphAttributes={};g.applyMatrix4(o.matrixWorld);
      const n=g.attributes.position.count;
      if(!g.attributes.normal)g.computeVertexNormals();
      if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(n*2),2));
      if(needColor&&!g.attributes.color)g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(n*3).fill(1),3));
      return g;
    });
    const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
    if(!geometry)continue;
    const mesh=new T.Mesh(geometry,list[0].material);mesh.castShadow=list[0].castShadow;mesh.receiveShadow=list[0].receiveShadow;mesh.renderOrder=list[0].renderOrder;
    scene.add(mesh);for(const o of list)o.removeFromParent();mergedMeshes++;removedMeshes+=list.length;
  }
  const send = (type, data) => parent.postMessage({ source: 'kart-m0', type, ...data }, location.origin);
  const marker = new T.Mesh(new T.SphereGeometry(0.55, 12, 8), new T.MeshBasicMaterial({color:'#fff7ba'}));
  marker.visible = false; scene.add(marker);

  function line(points, color, radius, y, closed = false) {
    const vectors = points.map(p=>{const [x,z]=world(p);return new T.Vector3(x,y,z);});
    const curve = new T.CatmullRomCurve3(vectors, closed, 'centripetal');
    return new T.Mesh(new T.TubeGeometry(curve, Math.max(64,points.length*2), radius, 4, false), new T.MeshBasicMaterial({color}));
  }
  function badge(text, color) {
    const cv=document.createElement('canvas'); cv.width=192;cv.height=112;
    const c=cv.getContext('2d');c.fillStyle='#112c32';c.beginPath();c.roundRect(4,4,184,100,25);c.fill();
    c.strokeStyle=color;c.lineWidth=6;c.stroke();c.fillStyle='#ffffff';c.textAlign='center';c.textBaseline='middle';
    c.font='bold 54px sans-serif';c.fillText(text,96,57);
    const texture=new T.CanvasTexture(cv);texture.colorSpace=T.SRGBColorSpace;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(3.1,1.8,1);sprite.renderOrder=20;
    return sprite;
  }
  for (const route of Object.values(ROUTES)) {
    const group = new T.Group();
    if (route.id === 'field') {
      const positions=[], indices=[];
      for (let i=0;i<route.points.length;i++) {
        const prev=route.points[i===0?route.points.length-2:i-1], next=route.points[(i+1)%(route.points.length-1)];
        const len=Math.hypot(next[0]-prev[0],next[1]-prev[1]), nx=-(next[1]-prev[1])/len,nz=(next[0]-prev[0])/len;
        const [x,z]=world(route.points[i]);
        positions.push(x+nx*route.width/2,0.11,z+nz*route.width/2,x-nx*route.width/2,0.11,z-nz*route.width/2);
        if(i) {const j=i*2;indices.push(j-2,j-1,j,j-1,j+1,j);}
      }
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      group.add(new T.Mesh(geometry,new T.MeshBasicMaterial({color:route.color,transparent:true,opacity:0.38,side:T.DoubleSide,depthWrite:false})));
      group.add(line(route.points,route.color,0.095,0.18));
    } else {
      // Straight draft segments: do not smooth into walls or imply a solved route.
      for(let i=1;i<route.points.length;i++) {
        const a=route.points[i-1],b=route.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
        for(let d=0;d<len;d+=40) {
          const end=Math.min(len,d+22);
          group.add(line([[a[0]+(b[0]-a[0])*d/len,a[1]+(b[1]-a[1])*d/len],[a[0]+(b[0]-a[0])*end/len,a[1]+(b[1]-a[1])*end/len]],route.color,0.13,0.26));
        }
      }
    }
    route.checkpoints.forEach((idx,i)=>{const p=route.points[Math.min(idx,route.points.length-1)], [x,z]=world(p),tag=badge(i===0?'起點':String(i+1),route.color);tag.position.set(x,2.5,z);group.add(tag);});
    routeGroups[route.id]=group;scene.add(group);
  }
  const warningGroup=new T.Group();
  ISSUES.forEach(issue=>{const [x,z]=world(issue.at);const tag=badge('!', '#eaa239');tag.position.set(x,4,z);warningGroup.add(tag);});
  scene.add(warningGroup);warningGroup.visible=false;

  const f1=floors.find(f=>f.id==='1F');
  // Batch boxes are world-space geometry. Keep anything that overlaps a 0.15–1.5 m vehicle band.
  const obstacles=f1.boxes.filter(b=>b.y1<1.5 && b.y2>0.15);
  const buildingRects=rooms.filter(r=>r.f.id==='1F'&&!r.open&&r.type!=='garden').map(r=>({...r.m,kind:'room',name:r.name}));
  const stairs=window.CAMPUS.stairs.map(s=>{const [x1,z1]=world([s.rect[0],s.rect[1]]),[x2,z2]=world([s.rect[2],s.rect[3]]);return{x1,z1,x2,z2,kind:'stairs'};});
  const walls=f1.segs.filter(s=>s.h>0.15);
  const allObstacles=[...obstacles,...buildingRects,...stairs];
  const audits=Object.fromEntries(Object.values(ROUTES).map(r=>[r.id,auditRoute(r,allObstacles,walls)]));
  const audit={date:'2026-10-25',units:'metres',vehicleBand:[0.15,1.5],obstacleBoxes:obstacles.length,buildingRects:buildingRects.length,wallSegments:walls.length,routes:audits,
    elevations:{outdoor:0,buildingBase:api.BASE},optimization:{mergedMeshes,removedMeshes,interiorFurniture:false,npcColliders:false},obstacles:allObstacles,walls,raised};
  const data=document.createElement('script');data.id='audit-data';data.type='application/json';data.textContent=JSON.stringify(audit);document.body.append(data);

  function setView(view) {
    tour=false;marker.visible=false;orbit.enabled=true;
    camera.fov=48;camera.updateProjectionMatrix();
    if(view==='field'){orbit.target.set(-0.5,0,49);camera.position.set(55,68,110);}
    else if(view==='gate'){orbit.target.set(-40,3,12);camera.position.set(-70,25,43);}
    else if(view==='north'){orbit.target.set(-3,1,-30);camera.position.set(-68,40,-78);}
    else {orbit.target.set(0,1,22);camera.position.set(-105,125,155);}
    orbit.update();send('view',{view});
  }
  function updateRoute(){for(const[id,g]of Object.entries(routeGroups))g.visible=showing&&id===routeId;warningGroup.visible=showing&&routeId==='campus';}
  addEventListener('message', e=>{
    if(e.source!==parent||e.origin!==location.origin||e.data?.source!=='kart-review')return;
    const m=e.data;
    if(m.type==='view')setView(m.view);
    if(m.type==='route'&&ROUTES[m.id]){routeId=m.id;progress=0;tour=false;marker.visible=false;orbit.enabled=true;updateRoute();}
    if(m.type==='overlay'){showing=m.visible;updateRoute();}
    if(m.type==='tour'){tour=!!m.active;orbit.enabled=!tour;marker.visible=tour;}
    if(m.type==='seek'){progress=Math.max(0,Math.min(.999,m.value));}
    if(m.type==='pause')hidden=m.paused;
    if(m.type==='quality'){
      quality=m.value;renderer.shadowMap.enabled=quality==='detail';renderer.setPixelRatio(quality==='detail'?Math.min(devicePixelRatio,1.5):Math.min(devicePixelRatio,1.25));renderer.setSize(innerWidth,innerHeight);
      scene.traverse(o=>{if(o.material)for(const mat of [].concat(o.material))mat.needsUpdate=true;});
      frames=[];
    }
    if(m.type==='audit')send('audit',{audit});
  });
  orbit.addEventListener('start',()=>{if(tour){tour=false;marker.visible=false;orbit.enabled=true;send('tour-end',{});}});
  setView('campus');updateRoute();
  send('ready',{audit,loadMs:Math.round(performance.now()-start),quality});
  let nextFrame=0;
  function loop(now){
    requestAnimationFrame(loop);
    if(now<nextFrame)return;nextFrame=now+1000/61;
    const elapsed=(now-last)/1000,dt=Math.min(.1,elapsed);last=now;
    if(hidden||document.hidden){frames=[];return;}
    if(tour){
      progress=(progress+Math.min(elapsed,1)/45)%1;
      const route=ROUTES[routeId],p=pointAt(route.points,progress),ahead=pointAt(route.points,progress+.035),[x,z]=world(p),[ax,az]=world(ahead);
      marker.position.set(x,.8,z);const dx=ax-x,dz=az-z,n=Math.hypot(dx,dz)||1;
      const desired=new T.Vector3(x-dx/n*9,10,z-dz/n*9);camera.position.lerp(desired,1-Math.exp(-dt*3));orbit.target.set(ax,0,az);camera.lookAt(orbit.target);
    } else orbit.update();
    const t0=performance.now();renderer.render(scene,camera);const cost=performance.now()-t0;
    if(elapsed>0)frames.push({dt:elapsed,cost});if(frames.length>180)frames.shift();
    if(now-lastMetrics>1000){
      const seconds=frames.reduce((s,f)=>s+f.dt,0);
      const metrics={fps:seconds?+(frames.length/seconds).toFixed(1):0,renderMs:frames.length?+(frames.reduce((s,f)=>s+f.cost,0)/frames.length).toFixed(2):0,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,pixelRatio:renderer.getPixelRatio(),viewport:[innerWidth,innerHeight],quality,samples:frames.length,progress:+progress.toFixed(3)};
      send('metrics',{metrics});lastMetrics=now;
    }
  }
  requestAnimationFrame(loop);
}

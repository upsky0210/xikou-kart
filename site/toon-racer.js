// Species-specific silhouettes remain readable from the follow camera.
function mergeGeometries(T,geometries){
  const gs=geometries.map(g=>g.index?g.toNonIndexed():g.clone()),result=new T.BufferGeometry();
  for(const key of ['position','normal','uv']){const size=gs[0].attributes[key].itemSize,total=gs.reduce((n,g)=>n+g.attributes[key].array.length,0),data=new Float32Array(total);let offset=0;for(const g of gs){data.set(g.attributes[key].array,offset);offset+=g.attributes[key].array.length;}result.setAttribute(key,new T.BufferAttribute(data,size));}gs.forEach(g=>g.dispose());return result;
}
export function buildToonRacer(T,p,{detail=false}={}){
  const driver=new T.Group(),head=new T.Group();driver.name=`racer-${p.id}`;head.name='animal-head';head.position.set(0,1.43,-.12);driver.add(head);
  const material=(color,roughness=.55)=>new T.MeshStandardMaterial({color,roughness});
  const fur=material(p.fur),cream=material(p.light),dark=material(p.dark),pink=material('#ec9eac'),ink=material('#20212b',.3),white=material('#fffbed',.3),iris=material({cat:'#5dba96',beagle:'#b48043',horse:'#6699ba',hamster:'#a97543',bunny:'#a56c89',meerkat:'#d2a652',macaque:'#9d6940',sheep:'#75abbd',boar:'#b39246'}[p.id]),suit=material(p.suit),accent=material(p.accent),mouth=material('#542633'),tongue=material('#e78295');
  function ell(parent,x,y,z,sx,sy,sz,m){const mesh=new T.Mesh(new T.SphereGeometry(1,detail?48:28,detail?32:20),m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;}
  function line(parent,points,r,m){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),mesh=new T.Mesh(new T.TubeGeometry(curve,16,r,7,false),m);parent.add(mesh);return mesh;}
  const shapes={bunny:[.40,.36,.34],cat:[.46,.36,.34],meerkat:[.31,.44,.30],hamster:[.49,.36,.37],beagle:[.38,.39,.34],macaque:[.39,.37,.34],horse:[.30,.44,.39],sheep:[.31,.34,.30],boar:[.43,.35,.38]};
  const [w,h,d]=shapes[p.id],skull=ell(head,0,0,0,w,h,d,fur);skull.name='animal-face';
  // Shape a continuous snout into the head surface, with different profiles.
  const muzzleDepth={bunny:.045,cat:.035,meerkat:.085,hamster:.02,beagle:.12,macaque:.025,horse:.16,sheep:.05,boar:.12}[p.id],vertices=skull.geometry.attributes.position;
  for(let i=0;i<vertices.count;i++){const z=vertices.getZ(i);if(z>0){const x=vertices.getX(i)*w,y=vertices.getY(i)*h;vertices.setZ(i,z+muzzleDepth/d*Math.exp(-((x/(w*.65))**4+((y+.12)/.20)**4))*Math.min(1,z*3));}}skull.geometry.computeVertexNormals();
  let furTexture=null;
  if(detail){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d');c.fillStyle='#888888';c.fillRect(0,0,1024,512);let seed=8107+p.number.charCodeAt(1);const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
    for(let i=0;i<28000;i++){const x=rand()*1024,y=rand()*512,v=65+Math.floor(rand()*120);c.strokeStyle=`rgb(${v},${v},${v})`;c.lineWidth=.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+(rand()-.5)*2,y+2+rand()*5);c.stroke();}
    furTexture=new T.CanvasTexture(canvas);for(const m of [fur,cream,dark]){m.bumpMap=furTexture;m.bumpScale=.006;m.roughness=.68;}
    // Physical eye material with fine, deterministic iris fibers.
    const eyeCanvas=document.createElement('canvas');eyeCanvas.width=eyeCanvas.height=512;const ceye=eyeCanvas.getContext('2d');ceye.fillStyle=p.id==='bunny'?'#986b94':p.id==='sheep'?'#477f96':'#997341';ceye.fillRect(0,0,512,512);
    for(let i=0;i<1100;i++){const a=rand()*Math.PI*2,r=40+rand()*190;ceye.strokeStyle=i%3?'rgba(18,28,20,.28)':'rgba(246,220,151,.35)';ceye.lineWidth=.5+rand();ceye.beginPath();ceye.moveTo(256+Math.cos(a)*r,256+Math.sin(a)*r);ceye.lineTo(256+Math.cos(a+.002)*(r+25),256+Math.sin(a+.002)*(r+25));ceye.stroke();}
    const texture=new T.CanvasTexture(eyeCanvas);texture.colorSpace=T.SRGBColorSpace;iris.map=texture;iris.color.set('#ffffff');iris.roughness=.23;
  }
  const features=[];
  function feature(name){features.push(name);}
  // A shaped lower face and smiling mouth give readable expressions at race distance.
  const mz=d+muzzleDepth*.65;
  ell(head,0,-.19,mz-.035,p.id==='horse'?.225:w*.64,.145,.10,cream);
  ell(head,0,-.225,mz+.053,w*.38,.077,.025,mouth);
  ell(head,.025,-.253,mz+.075,w*.20,.025,.012,tongue);
  for(const side of[-1,1])ell(head,side*w*.19,-.12,mz+.032,w*.35,.095,.075,cream);
  const nose=p.id==='boar'?pink:['cat','hamster','bunny'].includes(p.id)?pink:ink;
  ell(head,0,-.09,mz+.095,p.id==='boar'?.175:p.id==='beagle'?.112:.064,p.id==='boar'?.09:.048,.055,nose);
  if(['boar','horse'].includes(p.id))for(const side of[-1,1])ell(head,side*(p.id==='boar'?.064:.045),-.09,mz+.148,.019,.014,.008,dark);
  const ex=p.id==='meerkat'?.125:p.id==='horse'?.133:w*.39,ey=p.id==='horse'?.105:.07,ez=d*.86;
  for(const side of[-1,1]){
    if(p.id==='meerkat')ell(head,side*ex,ey,ez-.016,.125,.158,.045,dark);
    if(p.id==='macaque')ell(head,side*.14,.035,.277,.18,.24,.065,cream);
    ell(head,side*ex,ey,ez,.106,.137,.055,ink);
    ell(head,side*ex,ey+.003,ez+.011,.097,.125,.052,white);
    ell(head,side*ex-side*.008,ey-.003,ez+.055,.061,.082,.022,iris);
    ell(head,side*ex-side*.008,ey-.004,ez+.074,.036,.061,.014,ink);
    ell(head,side*ex-.022,ey+.037,ez+.087,.019,.024,.008,white);
    line(head,[[side*ex-.075,ey+.168,ez-.028],[side*ex,ey+.184,ez+.005],[side*ex+.075,ey+.15,ez-.012]],.021,dark);
  }
  feature('large-expressive-eyes');
  if(p.id==='cat'){
    feature('triangular-ears-striped-tail');
    for(const side of[-1,1])line(head,[[side*.15,.25,-.23],[side*.23,.14,-.28],[side*.27,.01,-.28]],.018,dark);
    line(head,[[0,.32,-.16],[0,.25,-.25],[0,.14,-.32]],.020,dark);
    for(const side of[-1,1]){
      const ear=new T.Mesh(new T.ConeGeometry(.19,.36,4),fur);ear.position.set(side*.32,.37,-.025);ear.rotation.z=-side*.22;head.add(ear);
      const inner=ear.clone();inner.geometry=new T.ConeGeometry(.115,.24,4);inner.material=pink;inner.position.z=.048;head.add(inner);
      for(let i=0;i<2;i++){const stripe=ell(head,side*(.40-i*.025),-.015-i*.09,.12,.027,.022,.13,dark);stripe.rotation.z=side*.3;}
      line(head,[[side*.24,-.14,.37],[side*.47,-.10,.38],[side*.56,-.07,.36]],.006,cream);
    }
    for(let i=-1;i<=1;i++)ell(head,i*.105,.28,.16,.025,.085,.028,dark);
    line(driver,[[0,.77,-.39],[.34,.72,-.66],[.59,.93,-.65],[.60,1.20,-.60]],.08,fur);
    for(let i=0;i<3;i++)ell(driver,.59,1.03+i*.055,-.63,.084,.022,.083,dark);
  }
  if(p.id==='bunny'){
    feature('long-ears-pink-inner-ears-front-teeth-puff-tail');
    for(const side of[-1,1]){const ear=ell(head,side*.20,.41,-.025,.105,.27,.082,fur);ear.rotation.z=-side*.16;const inner=ell(head,side*.20,.42,.039,.063,.205,.022,pink);inner.rotation.z=-side*.16;ell(head,side*.025,-.213,mz+.087,.022,.046,.015,white);}
    ell(driver,0,.78,-.46,.145,.14,.14,cream);
  }
  if(p.id==='meerkat'){
    feature('slender-head-dark-eye-mask');
    for(const side of[-1,1]){ell(head,side*.29,.22,-.02,.105,.12,.08,dark);ell(head,side*.29,.22,.036,.063,.075,.025,pink);}
    line(driver,[[0,.76,-.38],[.24,.62,-.72],[.49,.61,-.86]],.063,fur);
  }
  if(p.id==='hamster'){
    feature('wide-cheeks-round-ears-buck-teeth');ell(head,0,.015,-.365,.045,.23,.018,dark);
    for(const side of[-1,1]){ell(head,side*.40,.26,-.04,.14,.14,.085,fur);ell(head,side*.40,.27,.025,.085,.09,.025,pink);ell(head,side*.34,-.14,.16,.19,.17,.19,cream);ell(head,side*.34,-.10,.329,.065,.037,.012,pink);}
    for(const side of[-1,1])ell(head,side*.026,-.203,mz+.086,.023,.041,.013,white);
    ell(driver,0,.77,-.45,.11,.11,.11,cream);
  }
  if(p.id==='beagle'){
    feature('long-drooping-ears-white-blaze');
    for(const side of[-1,1]){const ear=ell(head,side*.38,-.07,-.015,.17,.36,.12,dark);ear.rotation.z=side*.18;ell(head,side*.39,-.12,.066,.105,.24,.05,fur);}
    ell(head,0,.17,.308,.065,.20,.034,cream);
    line(driver,[[0,.75,-.4],[.30,.91,-.66],[.42,1.13,-.66]],.065,fur);ell(driver,.42,1.14,-.66,.067,.11,.068,white);
  }
  if(p.id==='macaque'){
    feature('large-side-ears-face-mask-curled-tail');
    for(const side of[-1,1]){ell(head,side*.39,.01,-.015,.17,.19,.10,fur);ell(head,side*.41,.01,.055,.11,.13,.035,pink);}
    for(let i=-1;i<=1;i++)ell(head,i*.075,.33,.04,.075,.10,.085,dark);
    line(driver,[[0,.75,-.40],[.38,.65,-.65],[.56,.90,-.66],[.45,1.05,-.65],[.33,.97,-.65]],.055,fur);
  }
  if(p.id==='horse'){
    feature('long-muzzle-upright-ears-mane');
    for(const side of[-1,1]){ell(head,side*.22,.40,-.04,.105,.22,.085,fur);ell(head,side*.22,.41,.025,.055,.14,.025,pink);}
    for(let i=0;i<6;i++)ell(head,0,.35-i*.10,-.26,.11,.11,.11,dark);
    for(let i=-1;i<=1;i++){const tuft=ell(head,i*.065,.37,.12,.065,.13,.09,dark);tuft.rotation.z=-.3;}
    ell(head,0,.13,.37,.043,.18,.025,cream);ell(driver,.25,.65,-.65,.10,.28,.10,dark);
  }
  if(p.id==='sheep'){
    feature('wool-cloud-side-ears-bow');
    for(let i=0;i<14;i++){const a=i*Math.PI*2/14;ell(head,Math.cos(a)*.31,.07+Math.sin(a)*.27,-.07,.15,.15,.24,cream);}
    for(let i=-1;i<=1;i++)ell(head,i*.13,.29,.18,.11,.11,.10,cream);
    for(const side of[-1,1]){ell(head,side*.43,.015,0,.19,.085,.10,fur);ell(head,side*.46,.025,.075,.105,.04,.025,pink);const bow=ell(head,-.27+side*.08,.35,.20,.10,.065,.045,accent);bow.rotation.z=side*.4;}ell(head,-.27,.35,.24,.045,.045,.035,pink);
    ell(driver,0,.78,-.43,.13,.12,.13,cream);
  }
  if(p.id==='boar'){
    feature('broad-snout-tusks-bristle-crest');
    for(const side of[-1,1]){
      const ear=ell(head,side*.33,.28,-.04,.145,.18,.075,fur);ear.rotation.z=-side*.5;ell(head,side*.34,.29,.02,.08,.11,.022,pink);
      line(head,[[side*.24,-.22,.30],[side*.29,-.17,.39],[side*.28,-.09,.41]],.032,white);
    }
    for(let i=0;i<4;i++)ell(head,0,.33-i*.055,-.08-i*.065,.07,.11,.075,dark);
    const tail=new T.Mesh(new T.TorusGeometry(.10,.032,7,18,Math.PI*1.8),pink);tail.position.set(.39,.76,-.61);driver.add(tail);
  }
  ell(driver,0,.95,-.14,.26,.28,.21,suit);ell(driver,0,1.02,.055,.13,.18,.026,cream);
  for(const side of[-1,1]){
    line(driver,[[side*.19,1.12,-.07],[side*.31,.99,.12],[side*.18,1.0,.31]],.078,suit);
    ell(driver,side*.18,1,.31,.095,.08,.085,white);
    line(driver,[[side*.15,.80,-.12],[side*.17,.69,.30]],.085,suit);ell(driver,side*.17,.67,.37,.11,.08,.17,accent);
  }
  if(detail){
    const furMat=new T.MeshStandardMaterial({color:p.fur,roughness:.85}),coat=new T.InstancedMesh(new T.ConeGeometry(.0015,.014,3),furMat,4000),dummy=new T.Object3D(),up=new T.Vector3(0,1,0),normal=new T.Vector3();let seed=711+p.number.charCodeAt(1),count=0;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
    for(let attempt=0;attempt<18000&&count<4000;attempt++){const v=rand()*2-1,a=rand()*Math.PI*2,r=Math.sqrt(1-v*v),x=w*r*Math.sin(a),y=h*v,z=d*r*Math.cos(a);if(z>.04&&Math.abs(x)<w*.90&&y<h*.80)continue;normal.set(x/(w*w),y/(h*h),z/(d*d)).normalize();dummy.position.set(x,y,z).addScaledVector(normal,.003);dummy.quaternion.setFromUnitVectors(up,normal);dummy.scale.setScalar(.6+rand()*.7);dummy.updateMatrix();coat.setMatrixAt(count++,dummy.matrix);}
    coat.count=count;coat.name='instanced-short-fur';head.add(coat);features.push('fur-bump','radial-irises','instanced-short-fur');
  }
  // Batch static surfaces per material; facial detail does not add a draw call per eye part.
  function batch(group){group.updateMatrixWorld(true);const bins=new Map();for(const o of [...group.children])if(o.isMesh&&!o.isInstancedMesh){if(!bins.has(o.material))bins.set(o.material,[]);bins.get(o.material).push(o);}
    for(const [m,list]of bins){if(list.length<2)continue;const gs=list.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);}),g=mergeGeometries(T,gs);gs.forEach(g=>g.dispose());if(!g)continue;for(const o of list){o.removeFromParent();o.geometry.dispose();}const mesh=new T.Mesh(g,m);group.add(mesh);}}
  batch(head);batch(driver);
  head.scale.setScalar(1.10);head.userData.faceStyle=detail?`premium-${p.id}-v1`:'toon-v2';head.userData.features=features;head.userData.silhouette=shapes[p.id];driver.userData.racer=p.id;
  return{driver,head,profile:p};
}

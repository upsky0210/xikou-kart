// Original seated racers inspired by the supplied soft toy / character references.
// Colour and anatomy live on continuous surfaces; cheeks and eyes are not balls.
export const STORYBOOK_SPECIES = Object.freeze(['bunny','hamster','sheep']);
export function buildStorybookRacer(T,p){
  const rabbit=p.id==='bunny',sheep=p.id==='sheep';
  const a=rabbit?{w:.425,h:.365,d:.33,cheek:.15,muzzle:.065,mw:.255,mh:.15,my:-.155,ex:.18,ey:.035}:
    sheep?{w:.25,h:.40,d:.31,cheek:.07,muzzle:.105,mw:.205,mh:.20,my:-.14,ex:.112,ey:.135}:
    {w:.465,h:.35,d:.345,cheek:.13,muzzle:.048,mw:.34,mh:.16,my:-.15,ex:.215,ey:.075};
  let seed=3871+Number(p.number)*7919;
  const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),clamp=(v,l=0,h=1)=>Math.max(l,Math.min(h,v));
  const driver=new T.Group(),head=new T.Group();driver.name=`racer-${p.id}`;driver.userData.racer=p.id;
  head.name=`storybook-${p.id}-head`;head.position.set(0,rabbit?1.33:sheep?1.37:1.34,-.13);driver.add(head);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#888';ctx.fillRect(0,0,256,256);
  for(let i=0;i<6500;i++){const x=rand()*256,y=rand()*256,v=70+rand()*100;ctx.strokeStyle=`rgb(${v},${v},${v})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+.3,y+1.5+rand()*2);ctx.stroke();}
  const bump=new T.CanvasTexture(canvas);bump.wrapS=bump.wrapT=T.RepeatWrapping;
  const material=(color,roughness=.62,extra={})=>new T.MeshPhysicalMaterial({color,roughness,...extra});
  const baseColor=new T.Color(rabbit?'#fff5f3':sheep?'#293840':'#aaa29f'),pale=new T.Color('#fff9f1'),blush=new T.Color('#f0abb8');
  const skin=material('#ffffff',.69,{vertexColors:true,bumpMap:bump,bumpScale:sheep?.0015:.003}),fur=material(baseColor,.69,{bumpMap:bump,bumpScale:.003});
  const cream=material('#fff8e9',.8,{bumpMap:bump,bumpScale:.003,emissive:'#e6d7bc',emissiveIntensity:.09}),pink=material('#e9a2ac',.63),ink=material('#30282d',.36),white=material('#fffaf2',.24);
  const noseMat=material(sheep?'#19272e':'#e797a4',.34,{clearcoat:.35,clearcoatRoughness:.25}),mouth=material('#70414a',.6);
  const suit=material(p.suit,.67),accent=material(p.accent,.55),seam=material(sheep?'#a99cb2':'#e7cbd1',.77),glove=material(sheep?'#33434b':'#fff2ec',.68);
  const width=y=>1+a.cheek*Math.exp(-(((y+.13)/.20)**2))-.07*clamp((y-.14)/.22);
  const muzzle=(x,y)=>a.muzzle*Math.exp(-((x/a.mw)**4+((y-a.my)/a.mh)**4));
  const eyeInset=(x,y)=>.012*(Math.exp(-(((x-a.ex)/.13)**4+((y-a.ey)/.16)**4))+Math.exp(-(((x+a.ex)/.13)**4+((y-a.ey)/.16)**4)));
  const depth=(x,y)=>a.d*Math.sqrt(Math.max(.006,1-(x/(a.w*width(y)))**2-(y/a.h)**2))+muzzle(x,y)-eyeInset(x,y);
  const color=new T.Color();
  function coat(x,y,z){
    color.copy(baseColor);const front=clamp(z/a.d);
    if(!rabbit&&!sheep){const bib=clamp((-.035-y)/.15)*front,lowerMask=Math.exp(-((x/.40)**6+((y+.18)/.18)**6))*front;color.lerp(pale,Math.max(bib,lowerMask));}
    if(rabbit){const rose=(Math.exp(-(((x-.31)/.09)**2+((y+.135)/.075)**2))+Math.exp(-(((x+.31)/.09)**2+((y+.135)/.075)**2)))*front;color.lerp(blush,rose*.38);}
    return color;
  }
  function mesh(parent,g,m,name){const o=new T.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function ell(parent,pos,scale,m,name,segments=32){const o=mesh(parent,new T.SphereGeometry(1,segments,24),m,name);o.position.set(...pos);o.scale.set(...scale);return o;}
  function line(parent,points,r,m,name,taper=false){
    const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),g=new T.TubeGeometry(curve,24,r,8,false);
    if(taper){const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const t=Math.floor(i/9)/24,c=curve.getPointAt(t),f=.06+.94*Math.sin((.12+.88*t)*Math.PI);pos.setXYZ(i,c.x+(pos.getX(i)-c.x)*f,c.y+(pos.getY(i)-c.y)*f,c.z+(pos.getZ(i)-c.z)*f);}g.computeVertexNormals();}
    return mesh(parent,g,m,name);
  }
  const g=new T.SphereGeometry(1,128,80),v=g.attributes.position,colors=[];
  for(let i=0;i<v.count;i++){const y=v.getY(i)*a.h,x=v.getX(i)*a.w*width(y),z=v.getZ(i)*a.d,front=clamp(z/a.d);v.setXYZ(i,x,y,z+(muzzle(x,y)-eyeInset(x,y))*Math.min(1,front*3));const c=coat(x,y,z);colors.push(c.r,c.g,c.b);}
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();mesh(head,g,skin,'continuous-sculpted-skull');
  // Slightly domed conforming patches sit within sculpted eye sockets.
  function patch(cx,cy,rx,ry,m,offset,name,dome=0){
    const positions=[cx,cy,depth(cx,cy)+offset+dome],uv=[.5,.5],indices=[],n=48,rings=10;
    for(let r=1;r<=rings;r++)for(let i=0;i<n;i++){const t=r/rings,angle=i/n*Math.PI*2,x=cx+Math.cos(angle)*rx*t,y=cy+Math.sin(angle)*ry*t;positions.push(x,y,depth(x,y)+offset+dome*(1-t*t));uv.push((x-cx)/rx*.5+.5,(y-cy)/ry*.5+.5);const k=1+(r-1)*n+i,next=1+(r-1)*n+(i+1)%n;if(r===1)indices.push(0,k,next);else indices.push(k-n,k,next,k-n,next,next-n);}
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return mesh(head,geometry,m,name);
  }
  const irisCanvas=document.createElement('canvas');irisCanvas.width=irisCanvas.height=256;const ic=irisCanvas.getContext('2d'),gradient=ic.createRadialGradient(128,112,12,128,128,128);
  gradient.addColorStop(0,'#1d171d');gradient.addColorStop(.60,'#2a2028');gradient.addColorStop(.83,rabbit?'#73596e':sheep?'#554b43':'#685046');gradient.addColorStop(1,'#171a21');ic.fillStyle=gradient;ic.fillRect(0,0,256,256);
  const irisTexture=new T.CanvasTexture(irisCanvas);irisTexture.colorSpace=T.SRGBColorSpace;
  const iris=material('#ffffff',.18,{map:irisTexture,clearcoat:1,clearcoatRoughness:.13});
  const ew=sheep?.077:rabbit?.119:.096,eh=sheep?.102:rabbit?.139:.112;
  for(const side of[-1,1]){
    const x=side*a.ex,y=a.ey;
    patch(x,y,ew+.008,eh+.008,ink,.002,'eye-rim');patch(x,y,ew,eh,white,.004,'eye-white');
    patch(x-side*.003,y-.003,ew*(sheep?.82:.93),eh*.94,iris,.007,'iris',.009);
    patch(x-.025,y+.044,ew*.19,eh*.20,white,.020,'catchlight');patch(x+.025,y-.043,.007,.008,white,.021,'catchlight');
    const lid=[];for(let i=0;i<=18;i++){const t=i/18*Math.PI,xx=x+Math.cos(t)*(ew+.005),yy=y+Math.sin(t)*(eh+.005);lid.push([xx,yy,depth(xx,yy)+.010]);}line(head,lid,.007,sheep?fur:ink,'sculpted-eyelid');
    if(rabbit){
      for(let j=0;j<3;j++){const xx=x+side*(.08+j*.012),yy=y+.102-j*.015,zz=depth(xx,yy);line(head,[[xx,yy,zz+.012],[xx+side*.023,yy+.018,zz+.010],[xx+side*.039,yy+.035,zz]],.003,ink,'soft-eyelash',true);}
      const brow=[];for(let j=0;j<=10;j++){const xx=x-.055+j*.011,yy=.244+.014*Math.sin(j/10*Math.PI);brow.push([xx,yy,depth(xx,yy)+.005]);}line(head,brow,.009,material('#b88e83',.75),'gentle-brow',true);
    }
  }
  const ny=sheep?-.155:rabbit?-.12:-.11;
  if(sheep){
    for(const side of[-1,1])patch(side*.068,-.19,.016,.022,noseMat,.006,'nostril');
    line(head,[[-.065,-.282,depth(-.065,-.282)+.006],[0,-.30,depth(0,-.30)+.007],[.07,-.272,depth(.07,-.272)+.006]],.004,noseMat,'gentle-smile');
  }else{
    const ng=new T.SphereGeometry(1,40,24),np=ng.attributes.position;for(let i=0;i<np.count;i++)np.setX(i,np.getX(i)*(.62+.38*(np.getY(i)+1)/2));ng.computeVertexNormals();
    const nose=mesh(head,ng,noseMat,'sculpted-nose');nose.position.set(0,ny,depth(0,ny)+.012);nose.scale.set(rabbit?.047:.056,.035,.025);
    line(head,[[0,ny-.025,depth(0,ny-.025)+.009],[0,-.189,depth(0,-.189)+.011]],.0035,mouth,'philtrum');
    for(const side of[-1,1])line(head,[[0,-.185,depth(0,-.185)+.012],[side*.045,-.207,depth(side*.045,-.207)+.012],[side*.085,-.182,depth(side*.085,-.182)+.009]],.004,mouth,'gentle-smile');
    patch(0,-.235,rabbit?.052:.056,.037,mouth,.006,'smile-opening');
    for(const side of[-1,1])ell(head,[side*.019,-.222,depth(side*.019,-.222)+.013],[.017,.031,.012],white,'front-tooth');
    if(rabbit)patch(0,-.258,.022,.012,pink,.011,'tongue');
    else for(const side of[-1,1])for(let i=0;i<3;i++){
      const yy=-.15-i*.029;line(head,[[side*.27,yy,depth(side*.27,yy)+.007],[side*.42,yy+.016,.29],[side*(.57-i*.015),yy+.03-i*.02,.235]],.0018,cream,'whisker',true);
    }
  }
  // Petal-shaped ears are real bowls: thick pale rim, inset pink interior.
  function ear(side){
    const eg=new T.SphereGeometry(1,56,36),ep=eg.attributes.position,earColors=[],innerColor=new T.Color(sheep?'#80616b':'#efadba');
    for(let i=0;i<ep.count;i++){
      const y=ep.getY(i),x=ep.getX(i),z=ep.getZ(i),inset=clamp((1-(x/.73)**2-(y/.83)**2)*8)*clamp(z*5);
      ep.setXYZ(i,x*(1-.22*Math.max(0,y)),y,z*(1-inset*.26)+(rabbit?.18:.06)*Math.max(0,y)**2);
      color.copy(baseColor).lerp(innerColor,inset);earColors.push(color.r,color.g,color.b);
    }eg.setAttribute('color',new T.Float32BufferAttribute(earColors,3));eg.computeVertexNormals();
    const pos=rabbit?[side*.25,.435,-.055]:sheep?[side*.35,.13,-.055]:[side*.365,.29,-.055];
    const scale=rabbit?[.145,.315,.083]:sheep?[.20,.085,.074]:[.143,.137,.076],rotation=rabbit?-side*.36:sheep?side*.30:-side*.16;
    const outer=mesh(head,eg,skin,rabbit?'petal-ear':sheep?'drooping-ear':'round-ear');outer.position.set(...pos);outer.scale.set(...scale);outer.rotation.z=rotation;
  }
  for(const side of[-1,1])ear(side);
  if(rabbit){
    for(let i=0;i<3;i++){
      const tuft=new T.SphereGeometry(1,40,28),tv=tuft.attributes.position;
      for(let j=0;j<tv.count;j++){const y=tv.getY(j),t=(y+1)/2,x=-.075+i*.048+tv.getX(j)*.047*(.22+.78*t)+.065*(1-t)**2,yy=.27+y*.095+i*.008;tv.setXYZ(j,x,yy,depth(x,yy)+.008+tv.getZ(j)*.035);}tuft.computeVertexNormals();mesh(head,tuft,fur,'swept-forelock');
    }
  }
  // A single softly displaced fleece surface, with instanced small curls.
  function woolNoise(x,y,z){
    const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),smooth=t=>t*t*(3-2*t),fx=smooth(x-ix),fy=smooth(y-iy),fz=smooth(z-iz);
    let value=0;for(let dx=0;dx<2;dx++)for(let dy=0;dy<2;dy++)for(let dz=0;dz<2;dz++){const n=Math.sin((ix+dx)*127.1+(iy+dy)*311.7+(iz+dz)*74.7)*43758.5453;value+=(n-Math.floor(n))*(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz);}return value;
  }
  function fleece(parent,pos,scale,name,cap=false){
    const fg=new T.SphereGeometry(1,80,48,0,Math.PI*2,0,cap?1.52:Math.PI),fv=fg.attributes.position;
    for(let i=0;i<fv.count;i++){let x=fv.getX(i),y=fv.getY(i),z=fv.getZ(i);if(cap){const phi=Math.atan2(z,x),theta=Math.acos(clamp(y,-1,1))/1.52*(2.35-.65*Math.max(0,Math.sin(phi)));x=Math.cos(phi)*Math.sin(theta);y=Math.cos(theta);z=Math.sin(phi)*Math.sin(theta);}const r=1+.11*(woolNoise(x*7,y*7,z*7)-.5)+.05*(woolNoise(x*22,y*22,z*22)-.5);fv.setXYZ(i,x*r,y*r,z*r);}fg.computeVertexNormals();
    const surface=mesh(parent,fg,cream,name);surface.position.set(...pos);surface.scale.set(...scale);
    const curls=new T.InstancedMesh(new T.TorusGeometry(.007,.003,5,9,Math.PI*1.8),material('#fff8e9',.93,{emissive:'#e6d7bc',emissiveIntensity:.08}),cap?240:140),dummy=new T.Object3D(),normal=new T.Vector3(),front=new T.Vector3(0,0,1);
    for(let i=0;i<curls.count;i++){const y=cap?-.05+rand()*1.05:rand()*2-1,angle=rand()*Math.PI*2,r=Math.sqrt(1-y*y),x=Math.cos(angle)*r,z=Math.sin(angle)*r;normal.set(x/scale[0],y/scale[1],z/scale[2]).normalize();dummy.position.set(pos[0]+x*scale[0],pos[1]+y*scale[1],pos[2]+z*scale[2]).addScaledVector(normal,.005);dummy.quaternion.setFromUnitVectors(front,normal);dummy.scale.setScalar(.7+rand()*.6);dummy.updateMatrix();curls.setMatrixAt(i,dummy.matrix);}curls.name=cap?'fleece-crown-curls':'fleece-jacket-curls';parent.add(curls);
  }
  if(sheep){
    fleece(head,[0,.235,-.075],[.325,.245,.29],'sculpted-fleece-cap',true);
    // A small ribbon keeps her own racing identity without hiding the fleece.
    for(const side of[-1,1]){const loop=ell(head,[-.235+side*.057,.37,.14],[.068,.047,.025],accent,'ribbon-loop');loop.rotation.z=side*.4;}
    ell(head,[-.235,.37,.163],[.027,.028,.018],pink,'ribbon-knot');
  }
  // Seated racing body: both hands wrap the existing steering wheel at y=1,z=.30.
  if(sheep)fleece(driver,[0,.94,-.14],[.29,.27,.235],'fleece-racing-jacket');
  else ell(driver,[0,.93,-.14],[rabbit?.25:.30,.265,.235],suit,'tailored-racing-suit',48);
  ell(driver,[0,.99,.072],[.14,.18,.022],sheep?accent:cream,'chest-panel');
  line(driver,[[0,.85,.082],[0,.98,.099],[0,1.13,.054]],.006,seam,'jacket-zip');
  for(const side of[-1,1]){
    line(driver,[[side*.20,1.095,-.09],[side*.29,1.015,.10],[side*.18,1.0,.30]],sheep?.061:.073,sheep?fur:suit,'steering-arm');
    ell(driver,[side*.18,1.0,.30],[.083,.073,.078],glove,'steering-paw');
    for(let j=0;j<3;j++)line(driver,[[side*.18-.032+j*.026,1.026,.36],[side*.18-.032+j*.026,1.005,.374],[side*.18-.032+j*.026,.985,.36]],.003,sheep?ink:pink,'paw-stitch');
    line(driver,[[side*.15,.78,-.10],[side*.18,.69,.28]],.080,sheep?fur:suit,'seated-leg');
    ell(driver,[side*.18,.665,.365],[.105,.079,.15],sheep?fur:glove,'racing-boot');
    ell(driver,[side*.18,.646,.425],[.071,.025,.045],accent,'boot-toe');
  }
  ell(driver,[0,.83,-.43],sheep?[.105,.10,.10]:rabbit?[.095,.095,.095]:[.065,.065,.075],sheep?cream:fur,'soft-tail');
  // Fine silhouette fur is instanced; the wool uses curls instead of spikes.
  const strands=new T.InstancedMesh(new T.ConeGeometry(.0011,.009,3),material('#ffffff',.9),sheep?400:1500),dummy=new T.Object3D(),up=new T.Vector3(0,1,0),normal=new T.Vector3();let count=0;
  for(let attempt=0;attempt<10000&&count<strands.count;attempt++){const yy=rand()*2-1,angle=rand()*Math.PI*2,r=Math.sqrt(1-yy*yy),y=yy*a.h,x=Math.cos(angle)*r*a.w*width(y),z=Math.sin(angle)*r*a.d;if(z>.01&&Math.abs(x)<a.w*.94&&y<a.h*.8)continue;if(sheep&&y>.15)continue;normal.set(x/(a.w*a.w),y/(a.h*a.h),z/(a.d*a.d)).normalize();dummy.position.set(x,y,z).addScaledVector(normal,.002);dummy.quaternion.setFromUnitVectors(up,normal);dummy.scale.setScalar(.6+rand()*.7);dummy.updateMatrix();strands.setMatrixAt(count,dummy.matrix);strands.setColorAt(count,coat(x,y,z));count++;}strands.count=count;strands.name='instanced-short-fur';head.add(strands);
  head.userData={faceStyle:`premium-${p.id}-v3`,sculptRevision:3,anatomy:{...a},features:['continuous-skull','inset-glossy-eyes','surface-following-eyes',rabbit?'petal-ears-and-forelock':sheep?'charcoal-face-and-curled-fleece':'grey-white-coat-and-whiskers','both-hands-steering','no-food-props']};
  return {driver,head,profile:p};
}

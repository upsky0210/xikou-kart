// Original animal studies: shallow eyes follow the skull; one continuous muzzle.
export function addSculptedFace(T,head,p,surface){
  const material=(color,roughness=.65)=>new T.MeshStandardMaterial({color,roughness});
  const ink=material('#292b32'),iris=material(p.id==='cat'?'#528c75':'#865737'),white=material('#fffaf0'),fur=material(p.fur);
  const dog=p.id==='beagle',bump=(x,y)=>(dog?.09:.065)*Math.exp(-((x/.235)**4+((y+.155)/.135)**4));
  // Sculpt the skull itself, avoiding a separate cheek/muzzle ball and its seam.
  const vertices=surface.geometry.attributes.position;
  for(let i=0;i<vertices.count;i++){const z=vertices.getZ(i);if(z>0)vertices.setZ(i,z+bump(vertices.getX(i)*.43,vertices.getY(i)*.40)*Math.min(1,z*3)/.36);}
  vertices.needsUpdate=true;surface.geometry.computeVertexNormals();
  const depth=(x,y)=>.36*Math.sqrt(Math.max(.01,1-(x/.43)**2-(y/.40)**2))+bump(x,y);
  function patch(cx,cy,rx,ry,mat,offset,name){
    const points=[cx,cy,depth(cx,cy)+offset],indices=[];
    for(let ring=1;ring<=8;ring++)for(let i=0;i<48;i++){const a=i*Math.PI*2/48,x=cx+Math.cos(a)*rx*ring/8,y=cy+Math.sin(a)*ry*ring/8;points.push(x,y,depth(x,y)+offset);const n=1+(ring-1)*48+i,next=1+(ring-1)*48+(i+1)%48;if(ring===1)indices.push(0,n,next);else{const prev=n-48,prevNext=next-48;indices.push(prev,n,next,prev,next,prevNext);}}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.setIndex(indices);geo.computeVertexNormals();
    const mesh=new T.Mesh(geo,mat);mesh.name=name;head.add(mesh);return mesh;
  }
  function ell(x,y,z,sx,sy,sz,mat,name){const m=new T.Mesh(new T.SphereGeometry(1,32,24),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.name=name;head.add(m);return m;}
  function line(points,mat,r=.008){const curve=new T.CatmullRomCurve3(points.map(q=>new T.Vector3(...q)));const mesh=new T.Mesh(new T.TubeGeometry(curve,24,r,6,false),mat);head.add(mesh);}
  for(const side of[-1,1]){
    const x=side*.172,y=.065;
    patch(x,y,.105,.137,fur,.003,'integrated-eye-socket');
    patch(x,y,.088,.115,white,.006,'flush-eye-white');
    patch(x-side*.009,y-.003,.052,.078,iris,.009,'iris');
    patch(x-side*.009,y-.005,.032,.057,ink,.012,'pupil');
    patch(x-.021,y+.035,.017,.023,white,.015,'eye-light');
    const lid=[];for(let i=0;i<=12;i++){const a=Math.PI*i/12,xx=x+Math.cos(a)*.092,yy=y+Math.sin(a)*.119;lid.push([xx,yy,depth(xx,yy)+.014]);}line(lid,ink,.009);
    const brow=[];for(let i=0;i<=8;i++){const xx=x-.078+i*.0195,yy=.231+.014*Math.sin(i*Math.PI/8);brow.push([xx,yy,depth(xx,yy)+.007]);}line(brow,fur,.014);
  }
  ell(0,-.112,depth(0,-.112)+.014,dog?.068:.047,.034,.028,dog?ink:material('#c27d7a'),'soft-nose');
  const mouth=points=>points.map(([x,y])=>[x,y,depth(x,y)+.005]);
  line(mouth([[0,-.145],[0,-.175],[-.052,-.194],[-.094,-.179]]),ink,.005);
  line(mouth([[0,-.175],[.052,-.194],[.094,-.179]]),ink,.005);
  head.userData.faceStyle='sculpted-v1';
}

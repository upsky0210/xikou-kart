// Geometry and material tools only. Each species supplies its own anatomy.
export function sculptKit(T,seed){
  const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#888';c.fillRect(0,0,512,256);
  for(let i=0;i<18000;i++){const x=rand()*512,y=rand()*256,v=85+rand()*90;c.strokeStyle=`rgb(${v},${v},${v})`;c.lineWidth=.45;c.beginPath();c.moveTo(x,y);c.lineTo(x+(rand()-.5)*1.5,y+1+rand()*3);c.stroke();}
  const bump=new T.CanvasTexture(canvas);bump.wrapS=bump.wrapT=T.RepeatWrapping;
  const mat=(color,roughness=.7,extra={})=>new T.MeshPhysicalMaterial({color,roughness,...extra});
  const plush=(color,scale=.003)=>mat(color,.83,{bumpMap:bump,bumpScale:scale,sheen:.22,sheenRoughness:.9});
  const white=mat('#fff9ed',.25),ink=mat('#262329',.4);
  function mesh(parent,g,m,name){const o=new T.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function ell(parent,pos,scale,m,name,segments=40){const o=mesh(parent,new T.SphereGeometry(1,segments,28),m,name);o.position.set(...pos);o.scale.set(...scale);return o;}
  function line(parent,points,r,m,name,taper=false){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),g=new T.TubeGeometry(curve,28,r,8,false);if(taper){const v=g.attributes.position;for(let i=0;i<v.count;i++){const t=Math.floor(i/9)/28,p=curve.getPointAt(t),f=.12+.88*(1-t);v.setXYZ(i,p.x+(v.getX(i)-p.x)*f,p.y+(v.getY(i)-p.y)*f,p.z+(v.getZ(i)-p.z)*f);}g.computeVertexNormals();}return mesh(parent,g,m,name);}
  function skin(parent,{w,h,d,width=()=>1,project=()=>0,color,name='continuous-sculpted-skull',paintTexture=false}){
    const g=new T.SphereGeometry(1,128,80),v=g.attributes.position,colors=[],col=new T.Color();
    for(let i=0;i<v.count;i++){const y=v.getY(i)*h,x=v.getX(i)*w*width(y),z=v.getZ(i)*d;v.setXYZ(i,x,y,z+(z>0?project(x,y)*Math.min(1,z/d*3):0));col.set(color(x,y,z));colors.push(col.r,col.g,col.b);}
    g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const o=mesh(parent,g,plush('#ffffff'),name);o.material.vertexColors=true;
    if(paintTexture){
      const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const ctx=cv.getContext('2d'),image=ctx.createImageData(1024,512)||{data:new Uint8ClampedArray(1024*512*4)};
      const pixelColor=new T.Color();
      for(let row=0;row<512;row++)for(let column=0;column<1024;column++){
        const theta=(row+.5)/512*Math.PI,phi=(column+.5)/1024*Math.PI*2,y=Math.cos(theta)*h,x=-Math.cos(phi)*Math.sin(theta)*w*width(y),z=Math.sin(phi)*Math.sin(theta)*d,i=(row*1024+column)*4;
        pixelColor.set(color(x,y,z)).convertLinearToSRGB();image.data[i]=Math.round(pixelColor.r*255);image.data[i+1]=Math.round(pixelColor.g*255);image.data[i+2]=Math.round(pixelColor.b*255);image.data[i+3]=255;
      }ctx.putImageData(image,0,0);const map=new T.CanvasTexture(cv);map.colorSpace=T.SRGBColorSpace;o.material.map=map;o.material.vertexColors=false;
    }
    return {mesh:o,w,h,d,depth:(x,y)=>d*Math.sqrt(Math.max(.006,1-(x/(w*width(y)))**2-(y/h)**2))+project(x,y)};
  }
  function patch(parent,s,cx,cy,rx,ry,m,offset,name,dome=0){const vertices=[cx,cy,s.depth(cx,cy)+offset+dome],uv=[.5,.5],indices=[],n=48,rings=10;
    for(let r=1;r<=rings;r++)for(let i=0;i<n;i++){const t=r/rings,a=i/n*Math.PI*2,x=cx+Math.cos(a)*rx*t,y=cy+Math.sin(a)*ry*t;vertices.push(x,y,s.depth(x,y)+offset+dome*(1-t*t));uv.push((x-cx)/rx*.5+.5,(y-cy)/ry*.5+.5);const j=1+(r-1)*n+i,k=1+(r-1)*n+(i+1)%n;if(r===1)indices.push(0,j,k);else indices.push(j-n,j,k,j-n,k,k-n);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return mesh(parent,g,m,name);
  }
  function irisTexture(tone){const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d'),g=x.createRadialGradient(128,128,12,128,128,128);g.addColorStop(0,'#151317');g.addColorStop(.42,'#1c161a');g.addColorStop(.65,tone);g.addColorStop(.88,tone);g.addColorStop(1,'#211c24');x.fillStyle=g;x.fillRect(0,0,256,256);for(let i=0;i<720;i++){const a=rand()*Math.PI*2,r=54+rand()*65;x.strokeStyle=i%3?'rgba(18,15,19,.22)':'rgba(245,223,185,.18)';x.lineWidth=.5;x.beginPath();x.moveTo(128+Math.cos(a)*r,128+Math.sin(a)*r);x.lineTo(128+Math.cos(a)*Math.min(125,r+18),128+Math.sin(a)*Math.min(125,r+18));x.stroke();}const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;return tex;}
  function fibers(o,count,length,color,accept=()=>true,name='instanced-short-fur'){
    o.updateMatrix();const positions=o.geometry.attributes.position,normals=o.geometry.attributes.normal,coat=new T.InstancedMesh(new T.ConeGeometry(.0009,length,3),mat('#ffffff',.95),count),dummy=new T.Object3D(),n=new T.Vector3(),p=new T.Vector3(),up=new T.Vector3(0,1,0),normalMatrix=new T.Matrix3().getNormalMatrix(o.matrix);let used=0;
    for(let tries=0;tries<count*8&&used<count;tries++){const i=Math.floor(rand()*positions.count);p.fromBufferAttribute(positions,i);if(!accept(p))continue;n.fromBufferAttribute(normals,i).applyMatrix3(normalMatrix).normalize();const local=p.clone();p.applyMatrix4(o.matrix).addScaledVector(n,.001);dummy.position.copy(p);dummy.quaternion.setFromUnitVectors(up,n);dummy.scale.setScalar(.55+rand()*.8);dummy.updateMatrix();coat.setMatrixAt(used,dummy.matrix);coat.setColorAt(used,color===null?new T.Color().fromBufferAttribute(o.geometry.attributes.color,i):new T.Color(typeof color==='function'?color(local.x,local.y,local.z):color));used++;}
    coat.count=used;coat.name=name;o.parent.add(coat);return coat;
  }
  function facialLine(parent,s,xy,r,m,name){return line(parent,xy.map(([x,y])=>[x,y,s.depth(x,y)+.008]),r,m,name);}
  return {T,rand,clamp,mat,plush,bump,white,ink,mesh,ell,line,skin,patch,irisTexture,fibers,facialLine};
}

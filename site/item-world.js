export class ItemWorld {
  constructor(T,scene){
    this.T=T;this.root=new T.Group();this.root.name='school-item-world';scene.add(this.root);this.engine=null;this.boxes=[];
    const mat=(color,opacity=1)=>new T.MeshStandardMaterial({color,roughness:.5,transparent:opacity<1,opacity,depthWrite:opacity===1});
    this.materials={chalk:mat('#fff3e7'),plane:mat('#fff0c7'),blue:mat('#7abce1'),water:mat('#ad8fd8',.65),glue:mat('#edcb6f',.65),teal:mat('#70d9c6',.42),gold:new T.MeshBasicMaterial({color:'#f5d179',transparent:true,opacity:.65,depthWrite:false})};
    const mesh=(g,m,parent=this.root)=>{const o=new T.Mesh(g,m);parent.add(o);return o;};this.mesh=mesh;
    const chalkGeo=new T.CylinderGeometry(.065,.065,.7,10);this.projectiles=Array.from({length:24},()=>{const group=new T.Group(),chalk=mesh(chalkGeo,this.materials.chalk,group);chalk.rotation.x=Math.PI/2;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,.6,-.4,0,-.4,0,.07,-.15,0,0,.6,0,.07,-.15,.4,0,-.4,-.4,0,-.4,0,-.07,-.25,0,.07,-.15,.4,0,-.4,0,.07,-.15,0,-.07,-.25],3));g.computeVertexNormals();const plane=mesh(g,new T.MeshStandardMaterial({color:'#fff0c7',side:T.DoubleSide}),group);group.visible=false;this.root.add(group);return {group,chalk,plane};});
    this.traps=Array.from({length:16},()=>{const group=new T.Group();for(let i=0;i<5;i++){const o=mesh(new T.CircleGeometry(.45,16),this.materials.water,group);o.rotation.x=-Math.PI/2;o.position.set(Math.cos(i*2.4)*.30,.04+i*.002,Math.sin(i*2.4)*.30);}group.visible=false;this.root.add(group);return group;});
    this.shields=Array.from({length:4},()=>{const group=new T.Group(),ring=mesh(new T.TorusGeometry(.95,.025,6,40),this.materials.teal,group);ring.rotation.x=Math.PI/2;for(let i=0;i<4;i++){const bar=mesh(new T.BoxGeometry(.10,.12,.65),this.materials.teal,group),angle=i*Math.PI/2;bar.position.set(Math.sin(angle)*.92,0,Math.cos(angle)*.92);bar.rotation.y=angle+Math.PI/2;}group.visible=false;this.root.add(group);return group;});
    this.waves=Array.from({length:4},()=>{const o=mesh(new T.RingGeometry(.93,1,48),this.materials.gold);o.rotation.x=-Math.PI/2;o.visible=false;return o;});
    const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');c.fillStyle='#fff3d5';c.fillRect(0,0,256,256);c.strokeStyle='#168d88';c.lineWidth=17;c.strokeRect(9,9,238,238);c.fillStyle='#146b70';c.font='bold 96px "Microsoft JhengHei",sans-serif';c.textAlign='center';c.fillText('文',128,124);c.font='bold 64px sans-serif';c.fillText('?',128,207);this.texture=new T.CanvasTexture(cv);this.texture.colorSpace=T.SRGBColorSpace;
    this.boxMaterial=new T.MeshBasicMaterial({map:this.texture});this.boxGeometry=new T.BoxGeometry(.75,.75,.75);this.pencilGeometry=new T.CylinderGeometry(.035,.035,.65,6);this.pencilMaterials=['#e796a9','#ebc65e','#72b5cf'].map(c=>mat(c));
  }
  attach(engine){
    for(const box of this.boxes)box.removeFromParent();this.boxes=[];this.engine=engine;
    for(const supply of engine?.boxes??[]){const group=new this.T.Group();this.mesh(this.boxGeometry,this.boxMaterial,group);for(let i=0;i<3;i++){const pencil=this.mesh(this.pencilGeometry,this.pencilMaterials[i],group);pencil.position.set((i-1)*.14,.36,0);pencil.rotation.z=.45+i*.22;}this.root.add(group);this.boxes.push(group);}
  }
  update(visible){
    const e=this.engine;this.root.visible=!!e&&visible&&e.running;if(!this.root.visible)return;
    const player=e.actor('player'),t=e.time;
    this.boxes.forEach((g,i)=>{const p=e.boxes[i];g.visible=(player.pickups.get(p.id)??0)<=t;g.position.set(p.x,p.y+.8+Math.sin(t*2+i)*.09,p.z);g.rotation.y=t*.7+i;});
    this.projectiles.forEach((o,i)=>{const p=e.projectiles[i];o.group.visible=!!p;if(!p)return;o.group.position.set(p.x,p.y,p.z);o.group.rotation.y=p.yaw;o.chalk.visible=p.item==='chalk';o.plane.visible=p.item==='plane';});
    this.traps.forEach((g,i)=>{const p=e.traps[i];g.visible=!!p;if(!p)return;g.position.set(p.x,p.y+.09,p.z);for(const o of g.children)o.material=p.item==='water'?this.materials.water:this.materials.glue;});
    this.shields.forEach((g,i)=>{const a=e.actors[i];g.visible=!!a&&e.active(a)&&a.state.itemEffects.shield>0;if(!g.visible)return;g.position.set(a.state.x,e.floor(a)+.85,a.state.z);g.rotation.y=t*1.4;});
    this.waves.forEach((o,i)=>{const p=e.waves[i];o.visible=!!p;if(!p)return;o.position.set(p.x,p.y+.13,p.z);o.scale.setScalar(.3+Math.min(1,(t-p.born)/.3)*3.7);});
  }
}

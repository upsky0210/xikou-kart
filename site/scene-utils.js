import { mergeGeometries } from './campus/vendor/three/examples/jsm/utils/BufferGeometryUtils.js?build=20261031-daynight1';
export function prepareStaticScene(T,scene) {
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
  return {mergedMeshes,removedMeshes};
}

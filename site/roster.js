import * as T from 'three';
import {buildKart} from './kart-model.js?build=20261031-storybook5';
import {RACERS} from './racer-catalog.js?build=20261031-storybook5';
const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.append(renderer.domElement);
const notes=['尖耳・虎斑・翹尾','粉耳瓣・柔粉臉・小門牙','灰白毛・小門牙・握方向盤','垂耳・白鼻樑・白尾尖','大側耳・面罩・捲尾','長口鼻・鬃毛・直耳','黑色長臉・奶油捲羊毛','寬鼻盤・獠牙・鬃冠'];
const refined=new URLSearchParams(location.search).get('crew')==='storybook';
if(refined){document.querySelector('#grid').classList.add('refined');document.querySelector('h1').textContent='兔兔、羊妹與倉鼠 · 精緻車手';}
const crew=refined?['bunny','sheep','hamster'].map(id=>RACERS.find(r=>r.id===id)):RACERS;
const entries=crew.map(r=>{const i=RACERS.indexOf(r),card=document.createElement('div');card.className='card';card.dataset.racer=r.id;card.innerHTML=`<div class="view"></div><div class="caption">${r.name} · ${r.nickname}<small>${notes[i]}</small></div>`;document.querySelector('#grid').append(card);const scene=new T.Scene(),model=buildKart(T,r.id);scene.add(model.car);scene.add(new T.HemisphereLight('#fff5df','#718c93',1.3));const key=new T.DirectionalLight('#ffffff',2.7);key.position.set(-3,5,6);scene.add(key);const rim=new T.DirectionalLight('#b2dedc',1.5);rim.position.set(3,2,-4);scene.add(rim);return{scene,view:card.querySelector('.view'),model};});
let angle='front',close=true;
function render(){renderer.setSize(innerWidth,innerHeight);renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);for(const e of entries){const b=e.view.getBoundingClientRect();if(b.bottom<0||b.top>innerHeight)continue;const camera=new T.PerspectiveCamera(34,b.width/b.height,.1,30);camera.position.set(...(close?(angle==='back'?[-.6,1.65,-2.35]:angle==='side'?[2.45,1.65,.35]:[.55,1.65,2.35]):angle==='back'?[2.3,2.6,-4.7]:angle==='side'?[4.7,2.5,.4]:[1.0,2.4,4.9]));camera.lookAt(0,close?1.48:1.04,0);renderer.setViewport(b.left,innerHeight-b.bottom,b.width,b.height);renderer.setScissor(b.left,innerHeight-b.bottom,b.width,b.height);renderer.render(e.scene,camera);}}
document.querySelector('#detail').onclick=()=>{close=!close;document.querySelector('#detail').textContent=close?'全車':'臉部特寫';render();};
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>{angle=b.dataset.view;render();};addEventListener('resize',render);addEventListener('scroll',render);render();document.body.dataset.ready='true';

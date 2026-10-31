import {sculptKit} from './racer-sculpt-kit.js?build=20261031-wildlife3';
export const WILDLIFE_IDS=Object.freeze(['koala','raccoon','giraffe']);
export function buildWildlifeRacer(T,p){return ({koala:buildKoala,raccoon:buildRaccoon,giraffe:buildGiraffe})[p.id](T,p);}

function buildKoala(T,p){
  const k=sculptKit(T,77291),{clamp,plush,mat,ell,line,skin,patch,irisTexture,fibers,facialLine,white,ink}=k;
  const driver=new T.Group(),head=new T.Group();driver.name='racer-koala';driver.userData.racer='koala';head.position.set(0,1.35,-.12);head.name='koala-plush-head';driver.add(head);
  const grey=new T.Color('#aaa2a4'),cream=new T.Color('#fff2df'),rose=new T.Color('#eaa0a7'),col=new T.Color();
  const color=(x,y,z)=>{col.copy(grey);const front=clamp(z/.34),chin=clamp((-y-.18)/.15)*front;col.lerp(cream,chin*.22);const blush=(Math.exp(-(((x-.30)/.073)**2+((y+.14)/.055)**2))+Math.exp(-(((x+.30)/.073)**2+((y+.14)/.055)**2)))*front;return col.lerp(rose,blush*.5);};
  const face=skin(head,{w:.425,h:.365,d:.34,width:y=>1+.14*Math.exp(-(((y+.14)/.20)**2)),project:(x,y)=>.035*Math.exp(-((x/.28)**4+((y+.16)/.17)**4)),color});
  const fur=plush('#aaa2a4'),dark=plush('#5c5358',.0018),pink=plush('#efa8b1'),pale=plush('#fff0dc'),eye=mat('#ffffff',.2,{map:irisTexture('#6b493a'),clearcoat:1,clearcoatRoughness:.13});
  for(const side of[-1,1]){
    const x=side*.195,y=-.015;patch(head,face,x,y,.104,.115,dark,.003,'eye-rim');patch(head,face,x,y,.096,.107,white,.005,'eye-white');patch(head,face,x+side*.004,y-.006,.080,.091,eye,.009,'iris',.009);patch(head,face,x-.027,y+.035,.020,.023,white,.021,'catchlight');patch(head,face,x+.027,y-.043,.007,.008,white,.022,'catchlight');
    facialLine(head,face,[[x-.046,.165],[x-.015,.182],[x+.034,.171]],.008,dark,'koala-brow');
    const eg=new T.SphereGeometry(1,72,48),v=eg.attributes.position,colors=[];
    for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i),a=Math.atan2(y,x),r=1+.025*Math.cos(a*7)+.012*Math.sin(a*12),rad=Math.sqrt((x/.78)**2+(y/.85)**2),front=clamp(z*6),fringe=clamp((1.12-rad)*7)*front,inner=clamp((.77-rad)*9)*front;v.setXYZ(i,x*r,y*r,z*(1-.30*inner));col.copy(grey).lerp(cream,fringe).lerp(rose,inner);colors.push(col.r,col.g,col.b);}eg.setAttribute('color',new T.Float32BufferAttribute(colors,3));eg.computeVertexNormals();
    const ear=k.mesh(head,eg,face.mesh.material,'koala-fluffy-ear');ear.position.set(side*.415,.22,-.065);ear.scale.set(.215,.225,.11);ear.rotation.z=-side*.24;
    fibers(ear,1800,.012,(x,y,z)=>{const r=Math.sqrt((x/.78)**2+(y/.85)**2);return z>.1&&r<1.1?(r<.65?'#edb2bb':'#fff0df'):'#ada4a7';},v=>v.z<.30||Math.abs(v.x)>.45||Math.abs(v.y)>.45,'koala-ear-fluff');
    // Individual toe pads remain visible on the forward-facing boots.
    ell(driver,[side*.18,.675,.37],[.12,.10,.145],fur,'koala-foot');ell(driver,[side*.18,.68,.498],[.067,.057,.013],dark,'koala-palm-pad');
    for(let j=0;j<3;j++)ell(driver,[side*.18+(j-1)*.043,.744,.477],[.019,.023,.012],dark,'koala-toe-pad');
  }
  const noseMat=mat('#575058',.76,{bumpMap:k.bump,bumpScale:.004,sheen:.08});const nose=ell(head,[0,-.066,face.depth(0,-.066)+.025],[.105,.135,.064],noseMat,'koala-velvet-nose',64);
  // Subtle nostril dimples at the base of the large, textured oval nose.
  for(const side of[-1,1])ell(head,[side*.051,-.151,face.depth(0,-.066)+.068],[.012,.009,.006],dark,'koala-nostril');
  facialLine(head,face,[[.012,-.228],[.046,-.24],[.088,-.229],[.117,-.204]],.0047,dark,'koala-asymmetric-smile');
  for(let i=0;i<3;i++){const tuft=ell(head,[(i-1)*.043,.347+i%2*.025,-.015],[.028,.061,.034],fur,'koala-crown-tuft');tuft.rotation.z=(i-1)*-.35;}
  const body=ell(driver,[0,.95,-.13],[.285,.285,.245],fur,'koala-soft-body',48);
  const bib=ell(driver,[0,1.015,.073],[.18,.19,.032],pale,'koala-cream-chest');const bv=bib.geometry.attributes.position;
  for(let i=0;i<bv.count;i++){const y=bv.getY(i);bv.setX(i,bv.getX(i)*(.32+.68*(y+1)/2));}bib.geometry.computeVertexNormals();
  fibers(bib,1600,.014,'#fff2df',v=>v.z>.1,'koala-chest-fuzz');
  for(const side of[-1,1]){
    line(driver,[[side*.205,1.10,-.08],[side*.265,1.015,.10],[side*.18,1,.30]],.084,fur,'koala-steering-arm');ell(driver,[side*.18,1,.30],[.088,.074,.078],dark,'steering-paw');
    for(let j=0;j<3;j++)line(driver,[[side*.18+(j-1)*.028,1.023,.365],[side*.18+(j-1)*.028,1.001,.38]],.004,fur,'koala-finger-seam');
    line(driver,[[side*.15,.79,-.13],[side*.18,.70,.27]],.084,fur,'koala-seated-leg');
  }
  ell(driver,[0,.83,-.395],[.075,.075,.065],fur,'koala-small-tail');
  fibers(face.mesh,3800,.008,color,v=>v.z<.06||Math.abs(v.x)>.36||v.y>.26);fibers(body,1000,.009,'#aaa2a4',v=>v.z<0,'koala-body-fuzz');
  head.userData={faceStyle:'premium-koala-v1',sculptRevision:1,anatomy:{w:.425,h:.365,d:.34,muzzle:.035},features:['continuous-skull','velvet-oval-nose','scalloped-pink-cream-ears','ear-fibers','asymmetric-smile','toe-pads','both-hands-steering']};
  return{driver,head,profile:p};
}

function buildRaccoon(T,p){
  const k=sculptKit(T,61843),{clamp,plush,mat,ell,line,skin,patch,irisTexture,fibers,facialLine,white,ink}=k;
  const driver=new T.Group(),head=new T.Group();driver.name='racer-raccoon';driver.userData.racer='raccoon';head.position.set(0,1.36,-.14);head.name='raccoon-masked-head';driver.add(head);
  const base=new T.Color('#929892'),mask=new T.Color('#484346'),cream=new T.Color('#f6f0e3'),col=new T.Color();
  const color=(x,y,z)=>{col.copy(base);const front=clamp(z/.31*4),ax=Math.abs(x),top=.105-.42*Math.max(0,ax-.14),inside=clamp((ax-.067)*35)*clamp((top-y)*45)*clamp((y+.16)*40)*front,band=clamp((y-top-.007)*60)*clamp((top+.082-y)*45)*clamp((ax-.065)*35)*front;col.lerp(mask,inside).lerp(cream,band);const muzzle=Math.exp(-((x/.17)**4+((y+.15)/.115)**4))*front;return col.lerp(cream,muzzle);};
  const face=skin(head,{w:.425,h:.32,d:.31,width:y=>1+.28*Math.exp(-(((y+.105)/.16)**2))-.06*clamp((y-.10)/.20),project:(x,y)=>.095*Math.exp(-((x/.17)**4+((y+.15)/.12)**4)),color,paintTexture:true});
  const fur=plush('#929892'),dark=plush('#484346'),pale=plush('#f6f0e3'),noseMat=mat('#222d30',.24,{bumpMap:k.bump,bumpScale:.001,clearcoat:.55}),eye=mat('#ffffff',.15,{map:irisTexture('#35433f'),clearcoat:1,clearcoatRoughness:.08});
  for(const side of[-1,1]){
    const x=side*.202,y=.012;patch(head,face,x,y,.063,.078,dark,.002,'eye-rim');patch(head,face,x,y,.054,.068,eye,.006,'iris',.012);patch(head,face,x-.014,y+.023,.010,.013,white,.022,'catchlight');patch(head,face,x+.015,y-.024,.004,.005,white,.023,'catchlight');
    const eg=new T.SphereGeometry(1,64,40),v=eg.attributes.position,colors=[];
    for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i),inside=clamp((1-(x/.69)**2-(y/.76)**2)*7)*clamp(z*5);v.setZ(i,z*(1-.32*inside));col.copy(base).lerp(mask,inside);colors.push(col.r,col.g,col.b);}eg.setAttribute('color',new T.Float32BufferAttribute(colors,3));eg.computeVertexNormals();const ear=k.mesh(head,eg,face.mesh.material,'raccoon-bowl-ear');ear.position.set(side*.345,.27,-.065);ear.scale.set(.155,.17,.087);ear.rotation.z=-side*.25;ear.material=face.mesh.material.clone();ear.material.map=null;ear.material.vertexColors=true;
    fibers(ear,350,.007,'#a1a59a',v=>Math.abs(v.x)>.6||v.y>.6,'raccoon-ear-fuzz');
  }
  ell(head,[0,-.113,face.depth(0,-.113)+.023],[.079,.060,.044],noseMat,'raccoon-button-nose',56);
  for(const side of[-1,1])facialLine(head,face,[[0,-.181],[side*.035,-.213],[side*.079,-.209],[side*.102,-.192]],.0045,dark,'raccoon-smile');
  // Tiny cheek whiskers follow the angular mask, rather than inflating the cheeks.
  for(const side of[-1,1])for(let i=0;i<2;i++)line(head,[[side*.31,-.10-i*.026,face.depth(side*.31,-.10-i*.026)+.006],[side*.45,-.09-i*.034,.29],[side*.55,-.06-i*.053,.22]],.0015,pale,'raccoon-whisker',true);
  ell(driver,[0,.94,-.14],[.265,.295,.235],fur,'raccoon-pear-body',48);ell(driver,[0,.92,.068],[.168,.225,.028],pale,'raccoon-cream-belly');
  for(const side of[-1,1]){
    line(driver,[[side*.18,1.11,-.09],[side*.255,1.025,.12],[side*.18,1,.30]],.074,fur,'raccoon-reaching-arm');ell(driver,[side*.18,1,.30],[.080,.070,.078],dark,'steering-paw');
    for(let j=0;j<4;j++)line(driver,[[side*.18+(j-1.5)*.025,1.025,.36],[side*.18+(j-1.5)*.025,1.004,.384],[side*.18+(j-1.5)*.025,.981,.369]],.006,fur,'raccoon-long-finger');
    line(driver,[[side*.15,.80,-.11],[side*.18,.69,.27]],.083,fur,'raccoon-seated-leg');ell(driver,[side*.18,.665,.37],[.108,.077,.15],dark,'raccoon-foot');
    for(let j=0;j<3;j++)line(driver,[[side*.18+(j-1)*.04,.688,.462],[side*.18+(j-1)*.04,.663,.50]],.004,pale,'raccoon-toe-seam');
  }
  const curve=new T.CatmullRomCurve3([[-.10,.81,-.34],[-.38,.83,-.56],[-.62,.78,-.64],[-.68,.66,-.43]].map(v=>new T.Vector3(...v))),g=new T.TubeGeometry(curve,80,.135,14,false),v=g.attributes.position,colors=[];
  for(let i=0;i<v.count;i++){const t=Math.floor(i/15)/80,c=curve.getPointAt(t),radius=.65+.35*Math.sin(Math.PI*(.12+t*.78));v.setXYZ(i,c.x+(v.getX(i)-c.x)*radius,c.y+(v.getY(i)-c.y)*radius,c.z+(v.getZ(i)-c.z)*radius);const ring=Math.floor(t*7.5)%2;col.copy(ring?mask:base);colors.push(col.r,col.g,col.b);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const tail=k.mesh(driver,g,plush('#ffffff'),'raccoon-ringed-tail');tail.material.vertexColors=true;
  fibers(tail,1600,.012,null,()=>true,'raccoon-tail-fibers');
  fibers(face.mesh,3000,.007,color,v=>v.z<.03||Math.abs(v.x)>.39||v.y>.25);
  head.userData={faceStyle:'premium-raccoon-v1',sculptRevision:1,anatomy:{w:.425,h:.32,d:.31,muzzle:.095},features:['continuous-skull','angular-eye-mask','ivory-brow-bands','small-glass-eyes','striped-bushy-tail','long-fingers','both-hands-steering']};
  return{driver,head,profile:p};
}

function buildGiraffe(T,p){
  const k=sculptKit(T,92317),{clamp,plush,mat,ell,line,skin,patch,irisTexture,fibers,facialLine,white,ink}=k;
  const driver=new T.Group(),head=new T.Group();driver.name='racer-giraffe';driver.userData.racer='giraffe';head.position.set(0,1.58,-.10);head.name='giraffe-spotted-head';driver.add(head);
  const yellow=new T.Color('#efbf46'),brown=new T.Color('#9b5e38'),peach=new T.Color('#edbfa4'),col=new T.Color();
  const spots=[[-.18,.19,.12,.047],[.01,.24,.12,.043],[.15,.20,.13,.046],[-.09,.12,.23,.038],[.07,.14,.23,.040],[0,.145,.225,.031],[-.025,.225,.137,.024],[.21,.13,.14,.031],[-.22,.13,.14,.032],[-.24,.065,.10,.037],[.23,.06,.10,.042],[-.18,.15,-.16,.059],[.10,.18,-.20,.052],[.25,-.01,-.07,.050],[-.25,-.03,-.06,.053],[.02,.02,-.25,.066],[-.09,-.15,-.16,.043],[.16,-.13,-.13,.041]];
  function spotAt(x,y,z,items){let amount=0;for(let i=0;i<items.length;i++){const[cx,cy,cz,r]=items[i],dx=x-cx,dy=y-cy,dz=z-cz,theta=Math.atan2(dy,dx),edge=r*(1+.13*Math.cos(theta*5+i)+.08*Math.sin(theta*3-i));amount=Math.max(amount,clamp((edge-Math.hypot(dx,dy,dz))/.007));}return amount;}
  const color=(x,y,z)=>{col.copy(yellow).lerp(brown,spotAt(x,y,z,spots));const muzzle=clamp((-.035-y)/.065)*clamp(z/.265*4);return col.lerp(peach,muzzle);};
  const project=(x,y)=>.105*Math.exp(-((x/.27)**6+((y+.13)/.145)**6))-.014*(Math.exp(-(((x-.12)/.027)**2+((y+.12)/.024)**2))+Math.exp(-(((x+.12)/.027)**2+((y+.12)/.024)**2)));
  const face=skin(head,{w:.30,h:.27,d:.265,width:y=>1+.16*Math.exp(-(((y+.12)/.13)**2)),project,color,paintTexture:true});
  const fur=plush('#efbf46'),spot=plush('#9b5e38'),warm=plush('#dbaa77'),hoof=plush('#9c6545'),eye=mat('#ffffff',.19,{map:irisTexture('#426b99'),clearcoat:1,clearcoatRoughness:.12});
  for(const side of[-1,1]){
    const x=side*.125,y=.045;patch(head,face,x,y,.079,.100,ink,.002,'eye-rim');patch(head,face,x,y,.072,.093,white,.004,'eye-white');patch(head,face,x,y-.005,.058,.081,eye,.008,'iris',.008);patch(head,face,x-.018,y+.028,.012,.017,white,.021,'catchlight');patch(head,face,x+.020,y-.038,.005,.007,white,.022,'catchlight');
    for(let i=0;i<3;i++){const xx=x+side*(.047+i*.012),yy=y+.075-i*.015;line(head,[[xx,yy,face.depth(xx,yy)+.009],[xx+side*.024,yy+.012,face.depth(xx,yy)+.009],[xx+side*.041,yy+.028,face.depth(xx,yy)]],.0032,spot,'giraffe-eyelash',true);}
    patch(head,face,side*.12,-.12,.015,.020,hoof,.002,'giraffe-inset-nostril');
    line(head,[[side*.11,.225,-.045],[side*.13,.335,-.063],[side*.145,.448,-.066]],.025,fur,'giraffe-ossicone');ell(head,[side*.145,.455,-.066],[.047,.050,.045],spot,'giraffe-horn-tip');
    const eg=new T.SphereGeometry(1,56,36),v=eg.attributes.position,colors=[];for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i),inside=clamp((1-(x/.79)**2-(y/.70)**2)*8)*clamp(z*6);v.setXYZ(i,x*(.88+.12*(y+1)/2),y,z*(1-.40*inside));col.copy(yellow).lerp(peach,inside*.70);colors.push(col.r,col.g,col.b);}eg.setAttribute('color',new T.Float32BufferAttribute(colors,3));eg.computeVertexNormals();const ear=k.mesh(head,eg,face.mesh.material,'giraffe-leaf-ear');ear.position.set(side*.335,.145,-.045);ear.scale.set(.17,.084,.072);ear.rotation.z=side*.22;ear.material=face.mesh.material.clone();ear.material.map=null;ear.material.vertexColors=true;
    line(driver,[[side*.155,.98,-.08],[side*.265,1.025,.11],[side*.18,1,.30]],.062,fur,'giraffe-spotted-arm');ell(driver,[side*.18,1,.30],[.078,.071,.075],hoof,'steering-paw');line(driver,[[side*.18,1.025,.365],[side*.18,.98,.375]],.004,spot,'giraffe-cloven-hand');
    line(driver,[[side*.13,.78,-.10],[side*.18,.68,.28]],.075,fur,'giraffe-seated-leg');ell(driver,[side*.18,.66,.375],[.10,.075,.145],hoof,'giraffe-hoof');line(driver,[[side*.18,.69,.49],[side*.18,.63,.51]],.004,spot,'giraffe-hoof-cleft');
  }
  facialLine(head,face,[[-.065,-.222],[0,-.237],[.065,-.222]],.0038,warm,'giraffe-soft-smile');
  const body=ell(driver,[0,.86,-.14],[.225,.23,.215],fur,'giraffe-seated-body',64);
  const bodySpots=[[-.18,.10,.07,.043],[.16,.08,.08,.04],[-.09,-.10,.18,.041],[.13,-.08,.15,.042],[.08,.14,-.13,.05],[-.14,-.05,-.15,.046],[.20,-.07,-.02,.042]];
  const bp=body.geometry.attributes.position,bc=[];for(let i=0;i<bp.count;i++){col.copy(yellow).lerp(brown,spotAt(bp.getX(i)*.225,bp.getY(i)*.23,bp.getZ(i)*.215,bodySpots));bc.push(col.r,col.g,col.b);}body.geometry.setAttribute('color',new T.Float32BufferAttribute(bc,3));body.material=plush('#ffffff');body.material.vertexColors=true;
  const neckSpots=[];for(let row=0;row<5;row++)for(const side of[-1,1]){const y=.91+row*.10+(side>0?.023:0),r=.10+.06*(1-(y-.84)/.61)**1.8,angle=.70+k.rand()*.75;neckSpots.push([side*r*Math.sin(angle),y,-.12+r*Math.cos(angle),.027+k.rand()*.009]);}
  const points=Array.from({length:97},(_,i)=>{const t=i/96;return new T.Vector2(.10+.06*(1-t)**1.8,.84+t*.61);}),ng=new T.LatheGeometry(points,64),nv=ng.attributes.position,nc=[];
  for(let i=0;i<nv.count;i++){const x=nv.getX(i),y=nv.getY(i),z=nv.getZ(i)-.12;nv.setZ(i,z);col.copy(yellow).lerp(brown,spotAt(x,y,z,neckSpots));nc.push(col.r,col.g,col.b);}ng.setAttribute('color',new T.Float32BufferAttribute(nc,3));ng.computeVertexNormals();const neck=k.mesh(driver,ng,plush('#ffffff'),'giraffe-long-spotted-neck');neck.material.vertexColors=true;
  const mane=line(driver,[[0,.94,-.267],[0,1.14,-.25],[0,1.40,-.228]],.018,spot,'giraffe-neck-mane');fibers(mane,650,.014,'#9b5e38',()=>true,'giraffe-short-mane-fibers');
  for(const side of[-1,1])for(let i=0;i<3;i++)ell(driver,[side*(.17+i%2*.03),1.08-i*.046,-.01+i*.065],[.024,.029,.012],spot,'giraffe-arm-mark');
  line(driver,[[0,.82,-.33],[.23,.77,-.51],[.40,.83,-.60]],.024,fur,'giraffe-tail');ell(driver,[.40,.81,-.60],[.044,.08,.045],spot,'giraffe-tail-tassel');
  fibers(face.mesh,1600,.006,color,v=>v.z<0||v.y>.20);fibers(body,500,.006,'#efbf46',v=>v.z<0,'giraffe-body-fuzz');
  head.userData={faceStyle:'premium-giraffe-v1',sculptRevision:1,anatomy:{w:.30,h:.27,d:.265,muzzle:.105},features:['continuous-skull','irregular-brown-spots','peach-sculpted-muzzle','inset-nostrils','blue-irises-and-lashes','paired-ossicones','long-spotted-neck','both-hands-steering']};
  return{driver,head,profile:p};
}

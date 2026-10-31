const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function speedPresentation(speed=0,boost=false,covered=false){
  const forward=Math.max(0,speed),k=clamp(forward/11,0,1);
  return {
    fov:covered?68+6*k:60+15*k+(boost?5:0),
    distance:covered?3.7:5.0-.9*k,
    height:covered?2.5:2.6-.3*k,
    lines:clamp((forward-5)/8,0,.65)*(boost?1.25:1),
    pitch:65+forward*14+(boost?25:0),
  };
}

// Peripheral streaks only: the kart, next gate and touch controls stay clear.
export class SpeedFeedback {
  constructor(){
    this.canvas=document.createElement('canvas');this.canvas.className='speed-streaks';this.canvas.setAttribute('aria-hidden','true');document.body.append(this.canvas);
    this.ctx=this.canvas.getContext('2d');this.active=false;this.amount=0;this.updated=0;
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    const render=now=>{requestAnimationFrame(render);const c=this.canvas,ctx=this.ctx;if(!ctx)return;
      if(c.width!==innerWidth||c.height!==innerHeight){c.width=innerWidth;c.height=innerHeight;}
      ctx.clearRect(0,0,c.width,c.height);
      if(!this.active||this.motion.matches||now-this.updated>700||this.amount<.01)return;
      ctx.strokeStyle=`rgba(235,254,255,${this.amount*.55})`;ctx.lineWidth=1.7;
      const cx=c.width*.5,cy=c.height*.56;
      for(let i=0;i<26;i++){
        const a=i*2.399963,phase=(now*(.0005+this.amount*.0006)+i*.618)%1,r=.76+phase*.36;
        const ux=Math.cos(a),uy=Math.sin(a),edge=Math.min(c.width*.5/Math.max(.01,Math.abs(ux)),c.height*.5/Math.max(.01,Math.abs(uy)));
        const x=ux*edge,y=uy*edge;
        // Keep the central 65% free of overlays.
        ctx.beginPath();ctx.moveTo(cx+x*r,cy+y*r);ctx.lineTo(cx+x*(r+.045+this.amount*.09),cy+y*(r+.045+this.amount*.09));ctx.stroke();
      }
    };requestAnimationFrame(render);
  }
  update(s){this.active=!!s.playing&&!s.paused&&(!s.race||s.race.phase==='racing');this.amount=speedPresentation(s.speed,s.boostRemaining>0).lines;this.updated=performance.now();}
  stop(){this.active=false;this.amount=0;this.ctx?.clearRect(0,0,this.canvas.width,this.canvas.height);}
}

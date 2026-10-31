import {speedPresentation} from './speed-feedback.js?build=20261031-wildlife3';
export class GameSound {
  constructor(){this.context=null;this.master=null;this.muted=false;this.last=new Map();this.available=true;}
  unlock(){
    try{
      if(!this.context){const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context){this.available=false;return;}this.context=new Context();this.master=this.context.createGain();this.master.gain.value=this.muted?0:.10;this.master.connect(this.context.destination);}
      this.context.resume()?.catch(()=>{});
    }catch{this.available=false;}
  }
  setMuted(value){this.muted=!!value;if(this.context&&this.master)this.master.gain.setTargetAtTime(this.muted?0:.10,this.context.currentTime,.015);}
  updateDrive(s){
    const c=this.context;if(!c||!this.master)return;
    const active=!!s.playing&&!s.paused&&(!s.race||s.race.phase==='racing');
    if(!this.engine&&active){
      const oscillator=c.createOscillator(),gain=c.createGain(),filter=c.createBiquadFilter();
      oscillator.type='triangle';filter.type='lowpass';filter.frequency.value=650;gain.gain.value=0;
      oscillator.connect(filter);filter.connect(gain);gain.connect(this.master);oscillator.start();
      const buffer=c.createBuffer(1,c.sampleRate,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      const wind=c.createBufferSource(),windFilter=c.createBiquadFilter(),windGain=c.createGain();wind.buffer=buffer;wind.loop=true;windFilter.type='lowpass';windFilter.frequency.value=950;windGain.gain.value=0;
      wind.connect(windFilter);windFilter.connect(windGain);windGain.connect(this.master);wind.start();
      this.engine={oscillator,gain,wind,windGain};
    }
    if(!this.engine)return;
    const view=speedPresentation(Math.abs(s.speed||0),s.boostRemaining>0),t=c.currentTime;
    this.engine.oscillator.frequency.setTargetAtTime(view.pitch,t,.09);
    this.engine.gain.gain.setTargetAtTime(active?.12+Math.min(1,Math.abs(s.speed||0)/11)*.14:0,t,.08);
    this.engine.windGain.gain.setTargetAtTime(active?view.lines*.38:0,t,.12);
    clearTimeout(this.driveWatchdog);if(active)this.driveWatchdog=setTimeout(()=>this.updateDrive({}),700);
  }
  tone(frequency,start,duration=.10,type='sine',endFrequency=frequency){
    const c=this.context,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(Math.max(40,endFrequency),start+duration);
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(.5,start+.012);g.gain.exponentialRampToValueAtTime(.001,start+duration);
    o.connect(g);g.connect(this.master);o.start(start);o.stop(start+duration+.025);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  play(kind){
    if(this.muted||!this.context||this.context.state!=='running')return;
    const t=this.context.currentTime,minGap=kind==='collision'?.3:.12;if(t-(this.last.get(kind)??-Infinity)<minGap)return;this.last.set(kind,t);
    if(kind==='count')this.tone(660,t,.09);
    else if(kind==='go')this.tone(1046,t,.18);
    else if(kind==='collision')this.tone(170,t,.13,'triangle',85);
    else if(kind==='boost')this.tone(500,t,.18,'sine',1100);
    else if(kind==='charged')this.tone(880,t,.08);
    else if(kind==='finish')[523,659,784,1046].forEach((f,i)=>this.tone(f,t+i*.13,.16));
  }
}

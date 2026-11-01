import {ITEMS,itemIcon} from './item-catalog.js?build=20261101-items1';
export class ItemHud {
  constructor({enabled,onUse,onEvent}){
    this.enabled=enabled;this.lastEvent=0;this.held=undefined;this.onEvent=onEvent;
    const root=this.root=document.createElement('section');root.className='item-controls';root.hidden=true;root.setAttribute('aria-label','校園用品道具');
    root.innerHTML='<button id="useItem" type="button" disabled><span class="item-art"></span><b class="item-name">文具補給</b><small class="item-key">E／點一下使用</small></button><p class="item-effect" aria-live="polite"></p>';
    document.body.append(root);this.button=root.querySelector('button');this.button.onclick=onUse;
    this.splash=document.createElement('div');this.splash.className='water-splash';this.splash.setAttribute('aria-hidden','true');this.splash.innerHTML='<i class="paint-left"></i><i class="paint-right"></i><i class="paint-top"></i>';document.body.append(this.splash);
    document.body.classList.toggle('items-mode',enabled);
  }
  update(s){
    const item=s.items,active=this.enabled&&s.playing&&!s.paused&&s.race?.phase!=='finished';this.root.hidden=!active;
    this.button.disabled=!active||!item?.held||s.race?.phase==='countdown';
    if(this.held!==item?.held){this.held=item?.held;const info=ITEMS[this.held];this.root.querySelector('.item-art').innerHTML=itemIcon(this.held);this.root.querySelector('.item-name').textContent=info?.name??'找發光文具盒';this.button.setAttribute('aria-label',info?`使用${info.name}：${info.note}`:'尚無道具，尋找發光文具盒');this.button.title=info?.note??'經過發光文具盒取得校園用品';}
    const e=item?.effects??{},labels=[];if(e.milk>0)labels.push(`牛奶加速 ${e.milk.toFixed(1)}s`);if(e.shield>0)labels.push(`防護 ${e.shield.toFixed(1)}s`);if(e.water>0)labels.push(`水彩 ${e.water.toFixed(1)}s`);else if(e.slow>0)labels.push(`減速 ${e.slow.toFixed(1)}s`);else if(e.immune>0)labels.push('道具保護中');
    this.root.querySelector('.item-effect').textContent=labels.join(' · ');this.splash.style.opacity=active?String(Math.min(1,(e.water??0)/.5)):0;
    for(const event of item?.events??[])if(event.seq>this.lastEvent){this.lastEvent=event.seq;this.onEvent?.(event);}
  }
  stop(){this.root.hidden=true;this.splash.style.opacity=0;}
}

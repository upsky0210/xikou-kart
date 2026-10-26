// M1 uses v221 outdoor wall geometry (Git 8b97b7a). School rooms remain current.
// Source repository is never changed. M0 keeps its original v234 snapshot.
if (new URLSearchParams(location.search).has('drive') && window.CAMPUS) {
  window.KART_M1 = true;
  window.CAMPUS.outdoor.wall = { x1:300, y1:40, x2:new URLSearchParams(location.search).get('track')==='campus'?2060:1960, y2:new URLSearchParams(location.search).get('track')==='campus'?2280:2200 };
  delete window.CAMPUS.outdoor.northGap;
  window.CAMPUS.layoutVersion = new URLSearchParams(location.search).get('track')==='campus'?'campus race / v221 + east/south buffer':'v221 outdoor / 8b97b7a';
}

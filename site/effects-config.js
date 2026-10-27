import { world } from './track-config.js?build=sculpted-crew4';
import { ROUTE_ID } from './session-config.js?build=sculpted-crew4';
export const BOOST_PADS=ROUTE_ID==='courtyard'?[
  {id:'courtyard-stadium-north',pixel:[1250,1335],...pose([1250,1335]),yaw:Math.PI/2,width:3.2,length:4},
  {id:'courtyard-stadium-south',pixel:[1250,1835],...pose([1250,1835]),yaw:-Math.PI/2,width:3.2,length:4},
]:ROUTE_ID==='campus'?[
  {id:'stadium-north',pixel:[1100,1335],...pose([1100,1335]),yaw:-Math.PI/2,width:2.4,length:4},
  {id:'east',pixel:[1830,1000],...pose([1830,1000]),yaw:0,width:2.4,length:4},
  {id:'pool-south',pixel:[1250,2210],...pose([1250,2210]),yaw:-Math.PI/2,width:2.4,length:4},
]:[
  {id:'north',pixel:[920,1335],...pose([920,1335]),yaw:Math.PI/2,width:2.8,length:4},
  {id:'south',pixel:[1250,1835],...pose([1250,1835]),yaw:-Math.PI/2,width:2.8,length:4},
];
function pose(p){const[x,z]=world(p);return{x,z};}

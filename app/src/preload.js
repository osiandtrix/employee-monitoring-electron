/*const { default: mouseEvents } = require("mouse-hooks");

var totalDistance = 0;
var lastSeenAt = {x: null, y: null};
mouseEvents.addListener('mouse-move',e=>{
  console.log(JSON.stringify(e));
  if(lastSeenAt.x) {
    totalDistance += Math.sqrt(Math.pow(lastSeenAt.y - e.y, 2) + Math.pow(lastSeenAt.x - e.x, 2));
    //--------377=0.1meter
  console.log('So far your mouse ran this many pixels in Meters:   ' + Math.round(totalDistance/377));

  }
  lastSeenAt.x = e.x;
  lastSeenAt.y = e.y;

  
});*/

/*contextBridge.exposeInMainWorld("api",{
  getNames:getNames
})*/
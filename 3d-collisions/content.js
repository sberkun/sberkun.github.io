
var ply = {
    hold:-2, //-2 = nothing, -1 = background, 0-len = a sphere
    r:300, //radius of rotation
    centerX:0,centerY:0,centerZ:0, //center of rotation
    positionX:0,
    positionY:0,
    movementX:0,
    movementY:0,
    pastMovementX: [0,0,0,0,0],
    pastMovementY: [0,0,0,0,0],
    cpx: 0,
    cpy: 0,
    movementVx:0,
    movementVy:0,
    justletgo:false
};

function recalculateViewport(factor){
  if(!factor) factor = recalculateViewport.factor;
  else recalculateViewport.factor = factor;
  let w = Math.min(window.innerWidth, window.innerHeight);
  eee.z = -factor*w;
  ply.r = factor*375;
}
window.addEventListener("resize", function(){recalculateViewport();});
document.getElementById("settingsmenu").addEventListener('mousedown',function(e){event.stopPropagation();});
document.getElementById("lensSlider").addEventListener("input",function(e){
  recalculateViewport(Math.exp(-document.getElementById("lensSlider").value/100));
});

document.addEventListener('touchstart',function(touchE){
  ply.hold = -1;
  ply.positionX = touchE.targetTouches.item(0).clientX;
  ply.positionY = touchE.targetTouches.item(0).clientY;
  touchE.preventDefault();
});
document.addEventListener('touchend',function(touchE){
  ply.hold = -2;
  ply.justletgo = true;
  touchE.preventDefault();
});
document.addEventListener('touchmove',function(touchE){
  if(ply.hold===-2) return;
  if(ply.hold===-1){
    if(touchE.targetTouches.length!==1) return;
    let nx = touchE.targetTouches.item(0).clientX;
    let ny = touchE.targetTouches.item(0).clientY;
    ply.movementX+= (nx-ply.positionX)*1.5;
    ply.movementY+= (ny-ply.positionY)*1.5;
    ply.positionX = nx;
    ply.positionY = ny;
  }
  touchE.preventDefault();
});

document.addEventListener('mousedown',function(mouseE){
  ply.hold = -1;
});
document.addEventListener('mouseup',function(mouseE){
  ply.hold = -2;
  ply.justletgo = true;
});
document.addEventListener('mousemove',function(mouseE){
  if(ply.hold===-2) return;
  if(ply.hold===-1){
    ply.movementX+=mouseE.movementX;
    ply.movementY+=mouseE.movementY;
  }
});

document.addEventListener('keydown',function(){
  for(let a=0;a<objects.length;a++)
    if(objects[a].canmove){
      objects[a].vx = (Math.random()-0.5)*1.1;
      objects[a].vy = (Math.random()-0.5)*1.1;
      objects[a].vz = (Math.random()-0.5)*1.1;
    }
});


document.getElementById("score").innerText = "Drag the screen to view from different angles\nPress any key to begin the simulation";
var firstdragged = false;
var firstkeyed = false;
function handleFirstDrag(){
  document.removeEventListener('mousedown',handleFirstDrag);
  document.getElementById("score").innerText = firstkeyed?"":"\nPress any key to begin the simulation";
  firstdragged = true;
}
function handleFirstKey(){
  document.removeEventListener('mousedown',handleFirstKey);
  document.getElementById("score").innerText = firstdragged?"":"Drag the screen to view from different angles";
  firstkeyed = true;
}
document.addEventListener('mousedown',handleFirstDrag);
document.addEventListener('keydown',handleFirstKey);


var box = {
  x:-100,
  y:-100,
  z:-100,
  dx:200,
  dy:200,
  dz:200,
  indicators:[[],[],[],[],[],[]], //for each side of the box
  addIndicator:function(r,x,y,z){ //r: xmin, xmax, ymin...etc
    box.indicators[r].push({x:x,y:y,z:z});
  },
  drawEdge: function(n){
    let th = 1;
    switch(n){
      case 0: d3line(box.x       ,box.y,       box.z       ,box.x+box.dx,box.y       ,box.z       ,th); break;
      case 1: d3line(box.x       ,box.y,       box.z       ,box.x       ,box.y+box.dy,box.z       ,th); break;
      case 2: d3line(box.x       ,box.y       ,box.z       ,box.x       ,box.y       ,box.z+box.dz,th); break;
      
      case 3: d3line(box.x+box.dx,box.y       ,box.z       ,box.x+box.dx,box.y+box.dy,box.z       ,th); break;
      case 4: d3line(box.x+box.dx,box.y       ,box.z       ,box.x+box.dx,box.y       ,box.z+box.dz,th); break;
      case 5: d3line(box.x       ,box.y+box.dy,box.z       ,box.x+box.dx,box.y+box.dy,box.z       ,th); break;
      case 6: d3line(box.x       ,box.y+box.dy,box.z       ,box.x       ,box.y+box.dy,box.z+box.dz,th); break;
      case 7: d3line(box.x       ,box.y       ,box.z+box.dz,box.x+box.dx,box.y       ,box.z+box.dz,th); break;
      case 8: d3line(box.x       ,box.y       ,box.z+box.dz,box.x       ,box.y+box.dy,box.z+box.dz,th); break;
      
      case 9: d3line(box.x       ,box.y+box.dy,box.z+box.dz,box.x+box.dx,box.y+box.dy,box.z+box.dz,th); break;
      case 10:d3line(box.x+box.dx,box.y       ,box.z+box.dz,box.x+box.dx,box.y+box.dy,box.z+box.dz,th); break;
      case 11:d3line(box.x+box.dx,box.y+box.dy,box.z       ,box.x+box.dx,box.y+box.dy,box.z+box.dz,th); break;
    }
  },
  drawWithInside: function(insideF){
    var edges = [false,false,false,false,false,false, 
             false,false,false,false,false,false];
    var faces = [false,false,false,false,false];
    if(ccc.x<box.x)
      faces[0] = edges[1] = edges[2] = edges[6] = edges[8] = true;
    else if(ccc.x>box.x+box.dx)
      faces[1] = edges[3] = edges[4] = edges[10] = edges[11] = true;
    if(ccc.y<box.y)
      faces[2] = edges[0] = edges[2] = edges[4] = edges[7] = true;
    else if(ccc.y>box.y+box.dy)
      faces[3] = edges[5] = edges[6] = edges[9] = edges[11] = true;
    if(ccc.z<box.z)
      faces[4] = edges[0] = edges[1] = edges[3] = edges[5] = true;
    else if(ccc.z>box.z+box.dz)
      faces[5] = edges[7] = edges[8] = edges[9] = edges[10] = true;
    
    for(let a=0;a<edges.length;a++) if(!edges[a]) box.drawEdge(a);
    for(let a=0;a<faces.length;a++){ if(!faces[a]){
      let rr = box.indicators[a];
      //for(let b=0;b<rr.length;b++) d3point(rr[b].x,rr[b].y,rr[b].z,3);
      box.indicators[a] = [];
    }}
    insideF();
    for(let a=0;a<edges.length;a++) if(edges[a]) box.drawEdge(a);
    for(let a=0;a<faces.length;a++){ if(faces[a]){
      let rr = box.indicators[a];
      //for(let b=0;b<rr.length;b++) d3point(rr[b].x,rr[b].y,rr[b].z,3);
      box.indicators[a] = [];
    }}
  }
};

var objects = [
    new sphereObj(-50,-50,-50,30,1),
    new sphereObj(-50,-50, 50,30,1),
    new sphereObj( 50,-50,-50,30,1),
    new sphereObj( 50,-50, 50,30,1),
    new sphereObj(  0, 50,  0,30,1)
  ];
function sphereObj(x,y,z,r,mass){
  this.x=x;this.y=y;this.z=z;this.r=r;
  this.vx = 0;
  this.vy = 0;
  this.vz = 0;
  this.mass = mass;
  this.canmove = true;
}

function draw(){
    DRAW.clearRect(0,0,window.innerWidth,window.innerHeight);
    DRAW.lineWidth = 1;
    DRAW.strokeStyle = "rgb(0,0,0)";
    DRAW.fillStyle = "rgb(0,0,0)";
    
    setCameraPosition();
    
    box.drawWithInside(()=>{
      for(let a=0;a<objects.length;a++){
        d3sphere.add(objects[a].x,objects[a].y,objects[a].z,objects[a].r,1);
      }
      d3sphere.drawAll();
    });
    
    window.requestAnimationFrame(draw);
}

function setCameraPosition(){
  if(ply.hold===-1){
    ply.pastMovementX[ply.cpx] = ply.movementX;
    ply.pastMovementY[ply.cpy] = ply.movementY;
    ply.cpx = (ply.cpx+1)%ply.pastMovementX.length;
    ply.cpy = (ply.cpy+1)%ply.pastMovementY.length;
    rotateX(ply.movementY/750);
    rotateY(-ply.movementX/750);
    ply.movementX = 0;
    ply.movementY = 0;
  }else{ 
    if(ply.justletgo){
      let sumX = 0;
      for(let a=0;a<ply.pastMovementX.length;a++){
        sumX+= ply.pastMovementX[a];
        ply.pastMovementX[a] = 0;
      }
      let sumY = 0;
      for(let a=0;a<ply.pastMovementY.length;a++){
        sumY+= ply.pastMovementY[a];
        ply.pastMovementY[a] = 0;
      }
      ply.movementVx = sumX/ply.pastMovementX.length;
      ply.movementVy = sumY/ply.pastMovementY.length;
      ply.justletgo = false;
    }
    rotateX(ply.movementVy/750);
    rotateY(-ply.movementVx/750);
    ply.movementVy*=0.96;
    ply.movementVx*=0.96;
  }

  let q0 = qqq.w;
  let q1 = qqq.i;
  let q2 = qqq.j;
  let q3 = qqq.k;
  let s = 1/(q0*q0+q1*q1+q2*q2+q3*q3);

  ccc.x = ply.centerX-ply.r*(2*s*(q0*q2+q1*q3)); //from rotation matrix
  ccc.y = ply.centerY-ply.r*(2*s*(q2*q3-q0*q1)); //from rotation matrix
  ccc.z = ply.centerZ-ply.r*(1-2*s*(q1*q1+q2*q2)); //from rotation matrix
  
}


function update(){
  for(let a=0;a<10;a++){
    applyAcceleration();
    applyCollisions();
    moveObjects();
  }
}

function applyAcceleration(){
  for(let a=0;a<objects.length;a++){
    objects[a].vx*=0.9995;
    objects[a].vy*=0.9995;
    objects[a].vz*=0.9995;
  }
}
function applyCollisions(){
  for(let a=0;a<objects.length-1;a++){
    for(let b=a+1;b<objects.length;b++){
      objectCollision(objects[a],objects[b]);}}
  objects.forEach(boxCollision);
}
function moveObjects(){
  for(let a=0;a<objects.length;a++){
    if(objects[a].canmove){
      objects[a].x+=objects[a].vx;
      objects[a].y+=objects[a].vy;
      objects[a].z+=objects[a].vz;
    }
    else objects[a].canmove = true;
  }
}
function distsqrd(x1,y1,z1,x2,y2,z2){
  return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)+(z1-z2)*(z1-z2);
}

function objectCollision(obj1,obj2){
  var coRest = 1; //coefficient of restitution
  var nx1 = obj1.x+obj1.vx;
  var nx2 = obj2.x+obj2.vx;
  var ny1 = obj1.y+obj1.vy;
  var ny2 = obj2.y+obj2.vy;
  var nz1 = obj1.z+obj1.vz;
  var nz2 = obj2.z+obj2.vz;
  
  var sepsqrd = distsqrd(nx1,ny1,nz1,nx2,ny2,nz2);
  if(sepsqrd<=(obj1.r+obj2.r)*(obj1.r+obj2.r)){
    var inverseroot = 1/Math.sqrt(sepsqrd);
    var xcomp = (nx1-nx2)*inverseroot;
    var ycomp = (ny1-ny2)*inverseroot;
    var zcomp = (nz1-nz2)*inverseroot;
    var deltaV = (obj1.vx-obj2.vx)*xcomp+
                 (obj1.vy-obj2.vy)*ycomp+
                 (obj1.vz-obj2.vz)*zcomp;
    var impulseMag = (coRest+1)*deltaV*obj1.mass*obj2.mass/(obj1.mass+obj2.mass);
    obj1.vx-=impulseMag/obj1.mass*xcomp;
    obj1.vy-=impulseMag/obj1.mass*ycomp;
    obj1.vz-=impulseMag/obj1.mass*zcomp;
    obj2.vx+=impulseMag/obj2.mass*xcomp;
    obj2.vy+=impulseMag/obj2.mass*ycomp;
    obj2.vz+=impulseMag/obj2.mass*zcomp;
    obj1.canmove = false; //prevents them from re-colliding in the same physics frame
    obj2.canmove = false;
  }
}
function boxCollision(obj){
  let nx = obj.x+obj.vx;
  let ny = obj.y+obj.vy;
  let nz = obj.z+obj.vz;
  if(nx-obj.r<=box.x){
    obj.vx = -obj.vx; obj.canmove = false;
    box.addIndicator(0,box.x,ny,nz);
  }
  if(nx+obj.r>=box.x+box.dx){
    obj.vx = -obj.vx; obj.canmove = false;
    box.addIndicator(1,box.x+box.dx,ny,nz);
  }
  if(ny-obj.r<=box.y){
    obj.vy = -obj.vy; obj.canmove = false;
    box.addIndicator(2,nx,box.y,nz);
  }
  if(ny+obj.r>=box.y+box.dy){
    obj.vy = -obj.vy; obj.canmove = false;
    box.addIndicator(3,nx,box.y+box.dy,nz);
  }
  if(nz-obj.r<=box.z){
    obj.vz = -obj.vz; obj.canmove = false;
    box.addIndicator(4,nx,ny,box.z);
  }
  if(nz+obj.r>=box.z+box.dz){
    obj.vz = -obj.vz; obj.canmove = false;
    box.addIndicator(5,nx,ny,box.z+box.dz);
  }
}

window.onload = function(){
  recalculateViewport(2);
  window.setTimeout(draw, 250);
  window.setTimeout(function(){window.setInterval(update,20);}, 250);
}


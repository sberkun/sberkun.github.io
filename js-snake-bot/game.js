function coord(x,y){
  this.x = x;
  this.y = y;
}

function inpind(b,x,y){
  return BOARD.height*BOARD.width*b+BOARD.height*x+y;
}

const BOARD = {
  width:10,
  height:10,
  bS:0,
  x1:0,
  y1:0,
  draw:function(){
    DRAW.fillStyle = "black";
    rect(this.x1,this.y1,this.bS*this.width,this.bS*this.height);
  },
  drawPos: function(bcd){ //bcd = block coordinate
    rect(this.x1+bcd.x*this.bS+2,this.y1+bcd.y*this.bS+2,this.bS-4,this.bS-4);
  }
};
const PLY = {
  body:[new coord(0,0)],
  head: new coord(0,0),
  ludr: -1,
  draw: function(){
    DRAW.fillStyle = "white";
    for(let a in this.body) BOARD.drawPos(this.body[a]);
    DRAW.fillStyle = "yellow";
    BOARD.drawPos(this.head);
  },
  setludr: function(num){
    if(this.body.length<2){ this.ludr = num; return;}
    let nextx = this.head.x+(num===0?-1:num===3?1:0);
    let nexty = this.head.y+(num===1?-1:num===2?1:0);
    if(!(nextx===this.body[this.body.length-2].x&&nexty===this.body[this.body.length-2].y))
      this.ludr = num;
  },
  update: function(){
    if(doAI) AIControl3();
    if(this.ludr===-1) return true;
    let nextx = this.head.x+(this.ludr===0?-1:this.ludr===3?1:0);
    let nexty = this.head.y+(this.ludr===1?-1:this.ludr===2?1:0);
    if(this.contains(nextx,nexty)||
       nextx<0||
       nextx>=BOARD.width||
       nexty<0||
       nexty>=BOARD.height) return false;
    input[inpind(1,this.head.x,this.head.y)] = 0;
    this.head = new coord(nextx,nexty);
    this.body.push(this.head);
    input[inpind(0,this.head.x,this.head.y)] = 1;
    input[inpind(1,this.head.x,this.head.y)] = 1;
    if(this.head.x===APPLE.position.x&&this.head.y===APPLE.position.y)
      return APPLE.respawn();
    else{ 
      let old = this.body.splice(0,1)[0];
      input[inpind(0,old.x,old.y)] = 0;
      return true;
    }
  },
  contains: function(x,y){ 
    for(let a in this.body) if(this.body[a].x===x&&this.body[a].y===y) return true;
    return false;
  }
};
const APPLE = {
  position: new coord(Math.floor(Math.random()*BOARD.width),Math.floor(Math.random()*BOARD.height)),
  draw: function(){
    DRAW.fillStyle = "red";
    BOARD.drawPos(this.position);
  },
  respawn: function(){
    if(PLY.body.length===BOARD.width*BOARD.height) return false;
    input[inpind(2,APPLE.position.x,APPLE.position.y)] = 0;
    let where = Math.floor(Math.random()*(BOARD.width*BOARD.height-PLY.body.length));
    for(let a=0;a<BOARD.width;a++){ for(let b=0;b<BOARD.height;b++){
      if(!PLY.contains(a,b)) where--;
      if(where===-1){
        APPLE.position.x = a;
        APPLE.position.y = b;
        input[inpind(2,a,b)] = 1;
        return true;
      }
    }}
    alert("respawn failed");
    return false;
  }
};


function drawScene(){
  BOARD.draw();
  //PLY.draw();
  //APPLE.draw();
  
  DRAW.fillStyle = "white";
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    if(input[inpind(0,a,b)]) BOARD.drawPos({x:a,y:b});
  }}
  DRAW.fillStyle = "yellow";
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    if(input[inpind(1,a,b)]) BOARD.drawPos({x:a,y:b});
  }}
  DRAW.fillStyle = "red";
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    if(input[inpind(2,a,b)]) BOARD.drawPos({x:a,y:b});
  }}
  
  
  window.requestAnimationFrame(drawScene);
}

let run = true;
let doAI = false;

(function setUp(){
  DRAW.clearRect(0,0,canvas.width,canvas.height);
  let blockSize = 0;
  while(blockSize*BOARD.width<=canvas.width-20&&blockSize*BOARD.height<=canvas.height-20)
    blockSize++;
  blockSize--;
  BOARD.bS = blockSize;
  BOARD.x1 = Math.floor((canvas.width-blockSize*BOARD.width)/2);
  BOARD.y1 = Math.floor((canvas.height-blockSize*BOARD.height)/2);
  
  document.addEventListener('keydown',function(event){
    if(event.keyCode === 87){if(!doAI) PLY.setludr(1);}//'w'
    if(event.keyCode === 65){if(!doAI) PLY.setludr(0);}//'a'
    if(event.keyCode === 83){if(!doAI) PLY.setludr(2);}//'s'
    if(event.keyCode === 68){if(!doAI) PLY.setludr(3);}//'d'
    if(event.keyCode === 37){if(!doAI) PLY.setludr(0);}// <
    if(event.keyCode === 38){if(!doAI) PLY.setludr(1);}// ^
    if(event.keyCode === 40){if(!doAI) PLY.setludr(2);}// v
    if(event.keyCode === 39){if(!doAI) PLY.setludr(3);}// >
    if(event.keyCode === 32){run = !run;}
    if(event.keyCode === 8 ){gameRestart();}
  });
  
  input = [];
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    input.push(PLY.contains(a,b)?1:0);
  }}
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    input.push((a===PLY.head.x&&b===PLY.head.y)?1:0);
  }}
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    input.push((a===APPLE.position.x&&b===APPLE.position.y)?1:0);
  }}
  
  APPLE.respawn();
  
  AIControl3 = AIControl2;//setUpNN();
  
  
  doAI = true;
  run = true;
})();

function UPDATEALL(){
  if(!run) return;
  if(!PLY.update()){ window.clearInterval(updater); alert("Press backspace to restart"); return false;}
  return true;
}

let updater;
let intervaltime = 100;
window.setTimeout(function(){updater = window.setInterval(UPDATEALL,intervaltime);}, 500);
window.setTimeout(function(){window.requestAnimationFrame(drawScene);}, 500);

function gameRestart(){
  PLY.head = new coord(0,0);
  PLY.body = [PLY.head];
  PLY.ludr = -1;
  APPLE.respawn();
  
  input = [];
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    input.push(PLY.contains(a,b)?1:0);
  }}
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    input.push((a===PLY.head.x&&b===PLY.head.y)?1:0);
  }}
  for(let a=0;a<BOARD.width;a++){for(let b=0;b<BOARD.height;b++){
    input.push((a===APPLE.position.x&&b===APPLE.position.y)?1:0);
  }}
  
  window.clearInterval(updater);
  updater = window.setInterval(UPDATEALL,intervaltime);  
} 





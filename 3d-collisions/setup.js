 
const canvas = document.getElementById("myCanvas");
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
const DRAW = canvas.getContext("2d");

const optional = (()=>{let g=true;return (u)=>{if(g) g=confirm(u);}})();
function optional2(u){
  document.getElementById("score").innerText = u;
}



function line(x1,y1,x2,y2){
  DRAW.beginPath();
  DRAW.moveTo(x1,y1);
  DRAW.lineTo(x2,y2);
  DRAW.stroke();
}
function circle(x,y,r){
  DRAW.beginPath();
  DRAW.arc(x,y,r,0,2*Math.PI);
  DRAW.fill();
  DRAW.stroke();
}
function rect(x1,y1,w,h){
  DRAW.beginPath();
  DRAW.rect(x1,y1,w,h);
  DRAW.fill();
  DRAW.stroke();
}
function distsqrd(x1,y1,x2,y2){
  return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}


(function loadingScreen(){
  DRAW.fillStyle = "rgb(0,0,255)";
  DRAW.strokeStyle = "rgb(0,255,0)";
  DRAW.lineWidth = 5;
  circle(100,100,50);
  rect(100,100,200,200);
  circle(250,250,1);
  line(100,50,200,50);
  line(200,50,200,200);
  line(25,375,375,25);
  DRAW.fillStyle = "rgb(255,255,255)";
  DRAW.strokeStyle = "rgb(0,0,0)";
  DRAW.lineWidth = 1;
})();
  
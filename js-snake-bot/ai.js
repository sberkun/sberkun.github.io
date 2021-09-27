function AIControl(){
  
  if(PLY.head.y===0) PLY.setludr(0);
  if(PLY.head.x===0) PLY.setludr(2);
  if(PLY.head.y===BOARD.height-1){
    if(PLY.head.x%2===0) PLY.setludr(3);
    else PLY.setludr(1);
  }
  if(PLY.head.y===1&&PLY.head.x!==BOARD.width-1){
    if(PLY.head.x%2===1) PLY.setludr(3);
    else PLY.setludr(2);
  }
  
  
}





function futureInd(x,y){
  /*if(x<0||y<0||x>=BOARD.width||y>=BOARD.height) return -1;
  if(y===0){
    if(x===0) return 0;
    return BOARD.width*BOARD.height-x;
  }
  if(x%2===0) return x*(BOARD.height-1)+y;
  else return x*(BOARD.height-1)+(BOARD.height-y);*/
  
  if(x<0||y<0||x>=BOARD.width||y>=BOARD.height) return -1;
  let h1 = 2;
  let h2 = BOARD.height - h1;
  if(y<h1){
    if(x%2===0) return BOARD.width*BOARD.height - h1*(x+1) +y;
    else return BOARD.width*BOARD.height - h1*(x+1) +(h1-y-1);
  }else{
    if(x%2===0) return x*h2 + (y-h1);
    else return x*h2 + (h1+h2-y-1);
  }
  
  
}

function futureNum(obj){
  let fo = futureInd(obj.x,obj.y);
  if(fo=== -1) return -1;
  let fh = futureInd(PLY.head.x,PLY.head.y);
  if(fo>fh) return fo-fh;
  else return fo-fh+BOARD.width*BOARD.height; //futurenum of the head is w*h, not 0
}

function nextludr(){
  if(futureNum({x:PLY.head.x-1,y:PLY.head.y}) === 1) return 0;
  if(futureNum({x:PLY.head.x,y:PLY.head.y-1}) === 1) return 1;
  if(futureNum({x:PLY.head.x,y:PLY.head.y+1}) === 1) return 2;
  if(futureNum({x:PLY.head.x+1,y:PLY.head.y}) === 1) return 3;
}

function AIControl2(){
  let followMargin = 3;
  let fillMargin = BOARD.width*BOARD.height*0.25;
  if(BOARD.width*BOARD.height-PLY.body.length<=fillMargin){PLY.setludr(nextludr());return;}
  let minF = futureNum(PLY.body[0])+1-followMargin;
  if(futureNum(APPLE.position)+1<minF) minF = futureNum(APPLE.position)+1;
  
  let ludrF = [
    futureNum({x:PLY.head.x-1,y:PLY.head.y}),
    futureNum({x:PLY.head.x,y:PLY.head.y-1}),
    futureNum({x:PLY.head.x,y:PLY.head.y+1}),
    futureNum({x:PLY.head.x+1,y:PLY.head.y})
  ];
  
  let max = 0;
  let ind = -1;
  for(let a=0;a<4;a++) if(ludrF[a]>max&&ludrF[a]<minF){ max = ludrF[a]; ind = a; }
  if(ind === -1) PLY.setludr(nextludr());
  else PLY.setludr(ind);
}









let AIControl3;
let inp;
let hls = 6;
let npl = 6;
function sigmoid(x){
  let ex = Math.pow(Math.E,x);
  return ex/(ex+1);
}
function neuron(layer){
  this.weights = [];
  let len = (layer===0?input.length:npl);
  for(let a=0;a<len;a++) this.weights.push(Math.random()*2-1);
  this.bias = Math.random()*2-1;
  this.result = 0;
}
function maxInd(array){
  for(let a=0;a<array.length;a++){
    let big = true;
    for(let b=0;b<array.length;b++) if(array[b].result>array[a].result) big = false;
    if(big) return a;
  }
}
function setUpNN(){
  let neurons = [];
  for(let a=0;a<hls;a++){
    neurons.push([]);
    for(let b=0;b<npl;b++){
      neurons[a].push(new neuron(a));
    }
  }
  let outp = [new neuron(hls),new neuron(hls),new neuron(hls),new neuron(hls)];
  for(let a=0;a<4;a++){
    outp[a].bias = outp[0].bias;
  }


  function AIControl3(){
    for(let a=0;a<hls;a++){for(let b=0;b<npl;b++){
      //cumpute this neuron
      let sum = 0;
      let nn = neurons[a][b];
      if(a===0){
        for(let c=0;c<input.length;c++) sum+= nn.weights[c]*input[c];
      }else{
        for(let c=0;c<npl;c++) sum+=nn.weights[c]*neurons[a-1][c].result;
      }
      sum+=nn.bias;
      nn.result = sigmoid(sum);
    }}
    for(let b=0;b<4;b++){
      let sum = 0;
      let nn = outp[b];
      for(let c=0;c<npl;c++) sum+=nn.weights[c]*neurons[hls-1][c].result;
      sum+=nn.bias;
      nn.result = sigmoid(sum);
    }
    
    let result = maxInd(outp);
    PLY.setludr(result);
    return result;
  }
  AIControl3.neurons = neurons;
  AIControl3.outp = outp;
  
  return AIControl3;
}





function scoreOne(){
  gameRestart();
  let t = 0;
  let len = 1;
  while(t++<1000){
    if(PLY.body.length>len){len++;t=0;}
    if(!UPDATEALL()) return len+sigmoid(t)-1.5;
  }
  return len+sigmoid(t)-1.5;
}
function fitness(num){
  let sum = 0;
  for(let a=0;a<num;a++) sum+=scoreOne();
  return sum/num;
}
function evolveOne(){
  let base = fitness(10000);
  let tt = 0;
  for(let a=0;a<4;a++){
    let nn = AIControl3.outp[a];
    for(let c=0;c<nn.weights.length;c++){
      nn.weights[c]+=0.01;
      if(fitness(500)<base) nn.weights[c]-=0.02;
    }
    for(let d=0;d<10;d++){
      nn.bias+=0.01;
      if(fitness(500)<base) nn.bias-=0.02;
    }
    base = fitness(10000);
    console.log("finished neuron "+(tt++)+" out of "+(hls*npl+4));
  }
  for(let a=0;a<hls;a++){ for(let b=0;b<npl;b++){
    let nn = AIControl3.neurons[a][b];
    for(let c=0;c<nn.weights.length;c++){
      nn.weights[c]+=0.01;
      if(fitness(500)<base) nn.weights[c]-=0.02;
    }
    for(let d=0;d<10;d++){
      nn.bias+=0.01;
      if(fitness(500)<base) nn.bias-=0.02;
    }
    base = fitness(10000);
    console.log("finished neuron "+(tt++)+" out of "+(hls*npl+4));
  }}
  alert("done");
}







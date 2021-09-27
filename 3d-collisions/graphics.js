
/*
The following section deals with perspective projection.
All code and formulas are by Samuel Berkun,
with the exception of the quarternion rotation matrix 
(since that rotation matrix is just a conversion)
*/

const ccc = {x:0,y:0,z:0};
const qqq = {w:1,i:0,j:0,k:0};
const eee = {x:0,y:0,z:-500};


function rotateX(d){       //x as the very inside euler angle
  let cd = Math.cos(d/2);
  let sd = Math.sin(d/2);  
  qqq.w = cd*qqq.w-sd*qqq.i;
  qqq.i = cd*qqq.i+sd*qqq.w;
  qqq.j = cd*qqq.j+sd*qqq.k;
  qqq.k = cd*qqq.k-sd*qqq.j;
}

function rotateY(d){       //y as the very inside euler angle
  let cd = Math.cos(d/2);
  let sd = Math.sin(d/2);
  qqq.w = cd*qqq.w-sd*qqq.j;
  qqq.i = cd*qqq.i-sd*qqq.k;
  qqq.j = cd*qqq.j+sd*qqq.w;
  qqq.k = cd*qqq.k+sd*qqq.i;
}

const qqqstored = {w:0,i:0,j:0,k:0};
const rM = [0,0,0];
function transform(ax,ay,az){
    if(qqqstored.w!=qqq.w||qqqstored.i!=qqq.i||qqqstored.j!=qqq.j||qqqstored.k!=qqq.k){
      let q0 = qqqstored.w = qqq.w;
      let q1 = qqqstored.i = qqq.i;
      let q2 = qqqstored.j = qqq.j;
      let q3 = qqqstored.k = qqq.k;
      let s = 1/(q0*q0+q1*q1+q2*q2+q3*q3);
      
      //rM is the inverse of the quaternion rotation matrix
      //which is used as a camera transform
      rM[0] = [1-2*s*(q2*q2+q3*q3), 2*s*(q1*q2+q0*q3),   2*s*(q1*q3-q0*q2)  ];
      rM[1] = [2*s*(q1*q2-q0*q3),   1-2*s*(q1*q1+q3*q3), 2*s*(q0*q1+q2*q3)  ];
      rM[2] = [2*s*(q0*q2+q1*q3),   2*s*(q2*q3-q0*q1),   1-2*s*(q1*q1+q2*q2)];
    }
    let xx = ax-ccc.x;
    let yy = ay-ccc.y;
    let zz = az-ccc.z;

    return {
        x: rM[0][0]*xx + rM[0][1]*yy + rM[0][2]*zz,
        y: rM[1][0]*xx + rM[1][1]*yy + rM[1][2]*zz,
        z: rM[2][0]*xx + rM[2][1]*yy + rM[2][2]*zz,
    };
}

function d3point(a,b,c,tt){
    let ddd = transform(a,b,c);
    if(ddd.z>0){
        let coords = {x:eee.z*ddd.x/ddd.z-eee.x,y:eee.z*ddd.y/ddd.z-eee.y};
        DRAW.beginPath();
        DRAW.arc(coords.x+window.innerWidth/2,
                 coords.y+window.innerHeight/2,
                 -0.8*eee.z*tt/ddd.z,0,2*Math.PI);
        DRAW.fill();
    }
}
function d3line(a,b,c,d,e,f,tt){
    if((a-d)*(a-d)+(b-e)*(b-e)+(c-f)*(c-f)>25*25){
      let mx = (a+d)/2;
      let my = (b+e)/2;
      let mz = (c+f)/2;
      d3line(a,b,c,mx,my,mz,tt);
      d3line(mx,my,mz,d,e,f,tt);
      //split up long lines recursively - temporary fix w/ thickness
      //NOTE: change to trapazoids later instead of lines. Curved ends?
      return;
    }
  
    let dd1 = transform(a,b,c);
    let dd2 = transform(d,e,f);
    
    if(dd1.z>0||dd2.z>0){
    
        if(dd1.z<=0){
          let r = (dd2.z-1)/(dd2.z - dd1.z);
          dd1.z = 1;
          dd1.x = dd2.x + (dd1.x-dd2.x)*r;
          dd1.y = dd2.y + (dd1.y-dd2.y)*r;
        }
        else if(dd2.z<=0){
          let r = (dd1.z-1)/(dd1.z - dd2.z);
          dd2.z = 1;
          dd2.x = dd1.x + (dd2.x-dd1.x)*r;
          dd2.y = dd1.y + (dd2.y-dd1.y)*r;
        }
        
        DRAW.lineWidth = -2*eee.z*tt/(dd1.z+dd2.z);
        
        let coords1 = {x:eee.z*dd1.x/dd1.z-eee.x,y:eee.z*dd1.y/dd1.z-eee.y};
        let coords2 = {x:eee.z*dd2.x/dd2.z-eee.x,y:eee.z*dd2.y/dd2.z-eee.y};
        line(coords1.x+window.innerWidth/2,
             coords1.y+window.innerHeight/2,
             coords2.x+window.innerWidth/2,
             coords2.y+window.innerHeight/2);
    }
}


const d3sphere = {add:null,list:[],drawAll:null,drawOne:null};

d3sphere.add = function(a,b,c,r,tt){ 
  let comparevalue = (ccc.x-a)*(ccc.x-a)+(ccc.y-b)*(ccc.y-b)+(ccc.z-c)*(ccc.z-c);
  d3sphere.list.push({a:a,b:b,c:c,r:r,tt:tt,z:comparevalue}); 
};
d3sphere.drawAll = function(){
  d3sphere.list.sort((sa,sb)=>sb.z-sa.z);
  d3sphere.list.forEach((s)=>d3sphere.drawOne(s.a,s.b,s.c,s.r,s.tt));
  d3sphere.list = [];
};



//NO DISTORTION
//UPDATE CONDITION
d3sphere.drawOne = function(a,b,c,r,tt){
    d3point(a,b,c,1);
    let ddd = transform(a,b,c);
    a=ddd.x;b=ddd.y;c=ddd.z;
    if(c>r){
      let m = Math.sqrt(a*a+b*b+c*c-r*r);
      let centerx = eee.z*a*c/(c*c-r*r);
      let centery = eee.z*b*c/(c*c-r*r);
      let minoraxis = -eee.z*r/Math.sqrt(c*c-r*r);
      let majoraxis = -eee.z*m*r/(c*c-r*r);
      let angle = -Math.atan(a/b)||0;
      DRAW.lineWidth = -tt*eee.z/c;
      DRAW.beginPath();
      drawSphereImage(
        centerx-eee.x+window.innerWidth/2,
        centery-eee.y+window.innerHeight/2,
        minoraxis,
        majoraxis,
        angle,0,2*Math.PI
      );
      DRAW.stroke();
    }
};

let sphereimage = new Image();
sphereimage.src = "bluesphere.png";
sphereimage.adjustments = {xr: 1.675, yr: 1.031, cx: -0.0655, cy: 0.009}; //yes, I got them to 3 decimal places
//sphereimage.src = "sphere.png";
//sphereimage.adjustments = {xr:1.32,yr:1.29,cx:-0.051,cy:0.043};
function drawSphereImage(x,y,w,h,th){
    let xr = sphereimage.adjustments.xr*w;
    let yr = sphereimage.adjustments.yr*h;
    let cx = sphereimage.adjustments.cx*xr;
    let cy = sphereimage.adjustments.cy*yr;
    
    DRAW.save();
    DRAW.translate(x,y);
    DRAW.rotate(th);
    DRAW.drawImage(sphereimage,cx-xr,cy-yr,2*xr,2*yr);
    DRAW.restore();
    
    DRAW.lineWidth = 0.5;
    DRAW.beginPath();
    DRAW.ellipse(x,y,w,h,th,0,2*Math.PI);
    DRAW.stroke();
}




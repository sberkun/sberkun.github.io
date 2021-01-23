const visible_canvas = document.getElementById("visible-canvas");
const computation_canvas = document.createElement("canvas");
const turtle_image = document.createElement("img");
const visible_ctx = visible_canvas.getContext("2d");
const ctx = computation_canvas.getContext("2d"); 
const DRAW_SIZE = 1000; //also in rust, for the width and height functions
const OFFSET = 500; //for where (0,0) is in turtle coords
const SCALING_LIMIT = 32; //scaling can be [0, SL] inclusive
visible_canvas.width = DRAW_SIZE;
visible_canvas.height = DRAW_SIZE;
computation_canvas.width = DRAW_SIZE;
computation_canvas.height = DRAW_SIZE;
ctx.lineCap = "round"; //makes sure to also translate by 0.5, 0.5
turtle_image.src = "turtle-tiny.png";

let scaling_factor = 0; //default is 0=fit
let canvas_used;
let draw_calls;
let exitonclick;
let background_color;
let turtle_visible;
let pixelsize;
let pendown;
let current_path;
let turtle_x; //real_x = OFFSET + 0.5 + turtle_x
let turtle_y; //real_y = OFFSET + 0.5 - turtle_y
let turtle_dir;



function size_canvas(){
    let outW = visible_canvas.parentElement.clientWidth;
    let outH = visible_canvas.parentElement.clientHeight;
    let size = Math.min(outW,outH) - 10;
    
    if(scaling_factor===0){
        visible_canvas.style["width"] = size + "px"; //defaults to square aspect ratio so no need to set height
        visible_canvas.style["margin-top"]  = (outH - size)/2 + "px";
        visible_canvas.style["margin-left"] = (outW - size)/2 + "px";
        visible_canvas.style["margin-bottom"] = "";
        visible_canvas.style["margin-right"] = "";
        visible_canvas.classList.remove("scale-canvas-up");
    } else {
        visible_canvas.style["width"] = DRAW_SIZE*scaling_factor + "px";
        visible_canvas.style["margin-top"]  = "5px";
        visible_canvas.style["margin-left"] = "5px";
        visible_canvas.style["margin-bottom"] = "5px";
        visible_canvas.style["margin-right"] = "5px"; //for some reason margin-right is futile sigh
        visible_canvas.classList.add("scale-canvas-up");
    }
}
window.onresize = size_canvas;
size_canvas();

function copy_to_visible_canvas(){
    if(!canvas_used){
        canvas_used = true;
        toggle_canvas_visibility();
    }
    visible_ctx.clearRect(0, 0, DRAW_SIZE, DRAW_SIZE);
    visible_ctx.fillStyle = background_color;
    visible_ctx.fillRect(0, 0, DRAW_SIZE, DRAW_SIZE);
    visible_ctx.drawImage(computation_canvas, 0, 0);
    if(turtle_visible){
        visible_ctx.save();
        visible_ctx.translate(OFFSET + 0.5 + turtle_x, OFFSET + 0.5 - turtle_y);
        visible_ctx.rotate(turtle_dir*Math.PI/180);
        let turtle_scale = 1;
        visible_ctx.drawImage(
            turtle_image,
            -turtle_scale*turtle_image.width/2,
            -turtle_scale*turtle_image.height/2,
            turtle_scale*turtle_image.width,
            turtle_scale*turtle_image.height
        );
        visible_ctx.restore();
    }
}

function toggle_canvas_visibility(){
    if(canvas_used){
        visible_canvas.style.display = "block";
        document.getElementById("canvas-status").innerText = "x:     y:    ";
    }else{
        visible_canvas.style.display = "none";
        document.getElementById("canvas-status").innerText = "Canvas inactive";
    }
    toggle_button_status();
}

function toggle_button_status(){
    let pb = canvas_used && scaling_factor < SCALING_LIMIT;
    let mb = canvas_used && scaling_factor > 0;
    if(pb) document.getElementById("plus-button" ).classList.remove("inactive-button");
    else   document.getElementById("plus-button" ).classList.add(   "inactive-button");
    if(mb) document.getElementById("minus-button").classList.remove("inactive-button");
    else   document.getElementById("minus-button").classList.add(   "inactive-button");
}

function resize_canvas_with_scroll(){  
    let pp = visible_canvas.parentElement;
    let vp = (pp.clientHeight/2 + pp.scrollTop)/pp.scrollHeight;
    let hp = (pp.clientWidth/2 + pp.scrollLeft)/pp.scrollWidth;
    size_canvas();
    pp.scrollTop = vp*pp.scrollHeight - pp.clientHeight/2;
    pp.scrollLeft = hp*pp.scrollWidth - pp.clientWidth/2;
    toggle_button_status();
}

function zoom_in(){
    if(canvas_used && scaling_factor < SCALING_LIMIT){
        if(scaling_factor==0) scaling_factor++; else scaling_factor*=2;
        resize_canvas_with_scroll();
    }
}
function zoom_out(){
    if(canvas_used && scaling_factor > 0){
        if(scaling_factor<1.1) scaling_factor=0; else scaling_factor/=2;
        resize_canvas_with_scroll();
    }
}
document.getElementById("plus-button").onclick = zoom_in;
document.getElementById("minus-button").onclick = zoom_out;


export function reset_canvas(){
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    canvas_used = false;
    draw_calls = 0;
    exitonclick = false;
    background_color = "white";
    turtle_visible = true;
    pixelsize = 1;
    pendown = true;
    current_path = false;
    turtle_x = 0; //in turtle coords
    turtle_y = 0; //in turtle coords
    turtle_dir = 0; //in turtle coords, which is degrees clockwise from the north
    ctx.clearRect(0, 0, DRAW_SIZE, DRAW_SIZE);
    visible_ctx.clearRect(0, 0, visible_canvas.width, visible_canvas.height);
}
reset_canvas();

export function finish_canvas(){
    if(canvas_used) copy_to_visible_canvas();
    else toggle_canvas_visibility();
}

visible_canvas.onclick = function(){
    if(exitonclick){
        canvas_used = false; //so that it can be unhidden on next draw
        toggle_canvas_visibility();
    }
}

function show_turtle_coords(e){
    let xpos = e.offsetX*DRAW_SIZE/visible_canvas.offsetWidth - OFFSET;
    let ypos = OFFSET - e.offsetY*DRAW_SIZE/visible_canvas.offsetHeight + 1;
    let xstr = (Math.floor(xpos)+"").padStart(4," ");
    let ystr = (Math.floor(ypos)+"").padStart(4," ");
    document.getElementById("canvas-status").innerText = "x:"+xstr+" y:"+ystr;
}

visible_canvas.onmousemove = show_turtle_coords;
visible_canvas.onwheel = function(e){
    if(e.ctrlKey){
        e.preventDefault();
        if(e.deltaY < 0) zoom_in();
        else zoom_out();
    }
    show_turtle_coords(e);
};

visible_canvas.onmouseout = function(e){
    document.getElementById("canvas-status").innerText = "x:     y:    ";
}

function turtle_go_to(new_x, new_y){
    if(pendown) { //draw the line
        ctx.beginPath();
        ctx.moveTo(OFFSET + 0.5 + turtle_x, OFFSET + 0.5 - turtle_y);
        ctx.lineTo(OFFSET + 0.5 + new_x,    OFFSET + 0.5 - new_y);
        ctx.stroke();
    }
    
    if(current_path){ //add it to the path, regardless of pendown
        current_path.lineTo(OFFSET + 0.5 + new_x,    OFFSET + 0.5 - new_y);    
    }
    
    turtle_x = new_x;
    turtle_y = new_y;
}

function turtle_arc(radius, extent){
    let angle = (turtle_dir - 90)*Math.PI/180;
    let centerx = turtle_x + radius*Math.sin(angle);
    let centery = turtle_y + radius*Math.cos(angle);
    let counterclockwise = (radius > 0) == (extent > 0);
    let startangle = ((radius > 0 ? 0 : 180) + turtle_dir)*Math.PI/180;
    let endangle = startangle + Math.abs(extent)*Math.PI/180*(counterclockwise? -1:1);
    
    if(pendown) {
        ctx.beginPath();
        ctx.moveTo(OFFSET + 0.5 + turtle_x, OFFSET + 0.5 - turtle_y);
        ctx.arc(
            OFFSET + 0.5 + centerx,
            OFFSET + 0.5 - centery,
            Math.abs(radius), startangle, endangle, counterclockwise
        );
        ctx.stroke();
    }
    
    if(current_path){
        current_path.arc(
            OFFSET + 0.5 + centerx,
            OFFSET + 0.5 - centery,
            Math.abs(radius), startangle, endangle, counterclockwise
        );
    }
    
    turtle_dir += (radius > 0)? -extent: extent;
    turtle_x = centerx + radius*Math.cos(turtle_dir*Math.PI/180);
    turtle_y = centery - radius*Math.sin(turtle_dir*Math.PI/180);
}


export function draw_command(cmd){
    let angle = turtle_dir*Math.PI/180;
    switch(cmd[0]) {
        case "backward":
            turtle_go_to(turtle_x - cmd[1]*Math.sin(angle), turtle_y - cmd[1]*Math.cos(angle));
            break;
        case "begin_fill":
            current_path = new Path2D();
            current_path.moveTo(OFFSET + 0.5 + turtle_x, OFFSET + 0.5 - turtle_y);
            break;
        case "bgcolor":
            background_color = cmd[1];
            break;
        case "circle":
            if(cmd.length === 3) turtle_arc(cmd[1], cmd[2]);
            else turtle_arc(cmd[1], 360);
            break;
        case "clear":
            ctx.clearRect(0, 0, DRAW_SIZE, DRAW_SIZE); //doesn't reset background or path btw
            break;
        case "color":
            ctx.strokeStyle = cmd[1];
            ctx.fillStyle = cmd[1];
            break;
        case "end_fill":
            if(current_path){
                current_path.closePath();
                ctx.fill(current_path);
                ctx.stroke(current_path);
            }
            current_path = false; //not necessary, but speeds up turtle_go_to
            break;
        case "exitonclick":
            exitonclick = true;
            break;
        case "forward":
            turtle_go_to(turtle_x + cmd[1]*Math.sin(angle), turtle_y + cmd[1]*Math.cos(angle));
            break;
        case "hideturtle":
            turtle_visible = false;
            break;
        case "left":
            turtle_dir -= cmd[1];
            break;
        case "pendown":
            pendown = true;
            break;
        case "penup":
            pendown = false;
            break;
        case "pixel":
            ctx.save();
            ctx.fillStyle = cmd[3];
            ctx.fillRect(OFFSET+pixelsize*cmd[1], OFFSET-pixelsize*cmd[2]+1-pixelsize, pixelsize, pixelsize);
            ctx.restore();
            break;
        case "pixelsize":
            pixelsize = cmd[1];
            break;
        case "right":
            turtle_dir += cmd[1];
            break;
        case "setheading":
            turtle_dir = cmd[1];
            break;
        case "setposition":
            turtle_go_to(cmd[1], cmd[2]);
            break;
        case "showturtle":
            turtle_visible = true;
            break;
        default:
            alert("internal error: open javascript console for details");
            console.log("internal error: invalid command from web worker");
            console.log(cmd);
            
        //handled on backend:
            //rgb, screen_width, screen_height
        //do-nothing functions (handled on backend)
            //save-to-file, speed
        //all aliases are handled on backend
            
    }
    
    draw_calls++;
    if(draw_calls < 5 || draw_calls % 500 == 0) //for UI performance
        copy_to_visible_canvas();
}

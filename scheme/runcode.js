import { reset_canvas, finish_canvas, draw_from_buffer } from './canvas.js';

let running = false; //alternates between true and false in live programming mode
let live_programming = false;
let prev_code = ""; //for live programming mode
let myWorker = "I like cheese";
setWorker();



export function is_busy(){
    return running;
}

export function is_live_mode(){
    return live_programming;
}

function indicate_running(status){
    if(status){
        document.getElementById("stop-button").classList.remove("inactive-button");
        document.getElementById("gogo-button").classList.add("inactive-button");
        document.getElementById("run-button" ).classList.add("inactive-button");
    } else {
        document.getElementById("stop-button").classList.add("inactive-button");
        document.getElementById("gogo-button").classList.remove("inactive-button");
        document.getElementById("run-button" ).classList.remove("inactive-button");
    }
}

function add_output_text(text) {
    let rtmain = document.getElementById("right-top-main");
    let is_bottom = rtmain.scrollHeight - Math.abs(rtmain.scrollTop) === rtmain.clientHeight;
    rtmain.innerText += text;
    if(is_bottom) rtmain.scrollTop = rtmain.scrollHeight;
}

export function run_the_code() {
    if(running || live_programming) return;
    document.getElementById("execution-status").innerText = "Running code...";
    indicate_running(true);
    actually_run_the_darn_thing();
}

export function start_live_programming() {
    live_programming = true;
    document.getElementById("execution-status").innerText = "Running in live programming mode"
    indicate_running(true);
}

export function stop_the_code() {
    if(running){
        myWorker.terminate();
        setWorker();
        running = false;
        let statusstr = "Process terminated"
        document.getElementById("execution-status").innerText = statusstr;
        indicate_running(false);
        finish_canvas();
    }
    
    if(live_programming){
        live_programming = false;
        let statusstr = "Exited live programming mode"
        document.getElementById("execution-status").innerText = statusstr;
        indicate_running(false);
    }
}


function code_is_different() {
    let current = document.getElementById("editor-textarea").value;
    if(current == prev_code) return false;
    prev_code = current;
    return true;
}

setInterval(function(){ //live programming loop
    if(live_programming && !running && code_is_different())
        actually_run_the_darn_thing();
}, 500); //every 1/2 second



function actually_run_the_darn_thing(){ //doesn't indicate running because that's responsibility of caller
    running = true;
    document.getElementById("right-top-main").innerText = "";
    reset_canvas();
    myWorker.postMessage(document.getElementById("editor-textarea").value);
}

function worker_message(e) {
    if(e.data[0] == "finish"){
        running = false;
        if(!live_programming){ //in live programming mode execution status is ignored
            document.getElementById("execution-status").innerText = e.data[1];
            indicate_running(false);
        }
        finish_canvas(); //because white is an eyesore
    }
    else if(e.data[0] == "display"){
        add_output_text(e.data[1]);
    }
    else if(e.data[0] == "internalerror"){ //memory leak or something
        alert("internal error: open javascript console for details");
    }
    else if(e.data[0] == "restartbackend"){
        myWorker.terminate();
        setWorker();
    }
    else if(e.data[0] == "turtle"){
        draw_from_buffer(e.data[1], e.data[2]);
    }
    else {
        alert("internal error: open javascript console for details");
        console.log("internal error: invalid command from web worker");
        console.log(cmd);
    }
}

function setWorker() {
    myWorker = new Worker('worker.js');
    myWorker.onmessage = worker_message;
}


















import { UndoStack } from './undo.js';
import {is_busy, is_live_mode, run_the_code, start_live_programming, stop_the_code} from './runcode.js';
const CHEESE_VERSION = "cheese"; 

let prev_numlines = 0;
function add_gutter_numbers() {
    let numlines = document.getElementById("editor-textarea").value.split("\n").length;
    if(numlines == prev_numlines) return;
    prev_numlines = numlines;

    let outp_str = "1";
    for(let a=2;a<=numlines;a++){
        outp_str += "<br>"+a;
    }
    document.getElementById("inner-gutter").innerHTML = outp_str;
}
add_gutter_numbers();

let prev_raw = "";
function make_visible_text() {
    let raw = document.getElementById("editor-textarea").value;
    if(prev_raw == raw) return;
    prev_raw = raw;

    //I probably should use regex, but I'm bad at it so I won't
    //owiurhjorjgoergjeroijereg





    document.getElementById("inner-backdrop").textContent = raw;
}
make_visible_text();

function replace_editor_text(val) {
    document.getElementById("editor-textarea").value = val;
    add_gutter_numbers();
    make_visible_text();
}


let editor_undoredo = new UndoStack(
    200, 
    document.getElementById("editor-textarea").value,
    () => document.getElementById("editor-textarea").value,
    replace_editor_text
);

function scroll_editor() {
    let v_amt = document.getElementById("editor-textarea").scrollTop;
    let h_amt = document.getElementById("editor-textarea").scrollLeft;
    document.getElementById("inner-gutter"  ).style.top  = -v_amt+"px";
    document.getElementById("inner-backdrop").style.top  = -v_amt+"px";
    document.getElementById("inner-backdrop").style.left = -h_amt+"px";
}


function isLetter(str) {
    return str && str.length === 1 &&
    (str.charCodeAt(0) >= "a".charCodeAt(0) && str.charCodeAt(0) <= "z".charCodeAt(0) ||
    str.charCodeAt(0) >= "A".charCodeAt(0) && str.charCodeAt(0) <= "Z".charCodeAt(0));
}



function handle_input(e) {
    if (e.inputType == "insertLineBreak") {
        console.log("[need to handle tabs]");
    }

    if(!isLetter(e.data)) {
        editor_undoredo.save();
    }

    add_gutter_numbers();
    make_visible_text();
}

function handle_keydown(e) { //more like handle_tabs amiright
    if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        if(start == end) { //insert single tab

            // set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) +
              "  " + this.value.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 2;

        }
          

        editor_undoredo.save(); //so inserting a tab is an edit
        add_gutter_numbers();
        make_visible_text();
    }

    else if (e.key == 'z' && e.ctrlKey) {
        e.preventDefault();
        editor_undoredo.undo();
    }

    else if (e.key == 'y' && e.ctrlKey) {
        e.preventDefault();
        editor_undoredo.redo();
    }
    
    else if (e.key == 'Backspace' && e.ctrlKey) {
        e.preventDefault();
        stop_the_code();
    }

    else if (e.key == 'ArrowRight' || e.key == 'ArrowLeft' || e.key == 'ArrowUp' || e.key == 'ArrowDown'){
        make_visible_text();
    }
}

function global_handle_keydown(e) {
    if (e.key == 'Enter' && e.ctrlKey) {
        e.preventDefault();
        if(e.shiftKey && is_live_mode()) stop_the_code(); //toggle live programming off
        else if(e.shiftKey) start_live_programming(); //toggle live programming on
        else run_the_code(); //run once
    }
}

(function load_saved_from_localstorage(){
    if(localStorage.getItem("has_been_saved") != CHEESE_VERSION) return;
    document.getElementById("editor-textarea").value = localStorage.getItem("textarea_content");
    editor_undoredo.save();
    add_gutter_numbers();
    make_visible_text();
})();

function save_to_localstorage(){
    localStorage.setItem("textarea_content", document.getElementById("editor-textarea").value);
    localStorage.setItem("has_been_saved", CHEESE_VERSION);
}


window.onbeforeunload = save_to_localstorage;
document.getElementById("editor-textarea").onscroll = scroll_editor;
document.getElementById("editor-textarea").oninput = handle_input;
document.getElementById("editor-textarea").onkeydown = handle_keydown;
document.getElementById("editor-textarea").onclick = make_visible_text;
document.onkeydown = global_handle_keydown;
document.getElementById("run-button").onclick = run_the_code;
document.getElementById("gogo-button").onclick = start_live_programming;
document.getElementById("stop-button").onclick = stop_the_code;



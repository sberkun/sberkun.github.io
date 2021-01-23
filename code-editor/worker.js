importScripts("scheme_interpreter.js", "lexer.js"); 
wasm_bindgen("scheme_interpreter_bg.wasm").then((wasm) => {

    const { Universe, greet } = wasm_bindgen;
    let unv = Universe.new();
    console.log("started universe");
    
    onmessage = function(e) {
        inp = e.data;
        
        let tt = new Date().getTime();
        console.log("running the scheme code");
        global_ran_successfully = true;
        let needs_restarting = false;
        try {
            process(inp, unv);
        } catch (err) {
            console.error(err);
            global_ran_successfully = false;
            needs_restarting = true;
            postMessage(["display",
`Rust backend crashed due to an internal error! There are two possibilities:
(1) Your code is too recursive, and the program ran out of stack space. 
    In this case, you should try to make your program tail-recursive.
(2) There was a bug in the backend. 
    If this is the case, please contact me at sberkun@berkeley.edu
You can check the javascript console if you would like to see what the internal error is.
`]);
        }
        tt = new Date().getTime() - tt;
        let statustype = global_ran_successfully?"Finished successfully":"Errored out";
        let statusstr = statustype+" in "+(tt/1000).toFixed(3)+" seconds";
        console.log("finished");
        postMessage(["finish", statusstr]); 
        if(needs_restarting) postMessage(["restartbackend"]);
    }
});

let global_ran_successfully = true;

function process(inp, unv){
    unv.reset_universe();
    if(tokenize_lines(inp))
        unv.run_scheme_code(global_token_types.length);
    
    //unv.print_state(); //TODO remove
}

function report_internal_error(s){
    console.log("weewooweewoo internal error: "+s); //TODO send alert
    postMessage(["internalerror"]);
    global_ran_successfully = false;
}

function display_err(s){
    postMessage(["display",s]);
    global_ran_successfully = false;
}

function display(s){
    postMessage(["display",s]);
}

function turtle_0(name){
    postMessage([name]);
}
function turtle_1(name, s1){
    postMessage([name, tp(s1)]);
}
function turtle_2(name, s1, s2){
    postMessage([name, tp(s1), tp(s2)]);
}
function turtle_3(name, s1, s2, s3){
    postMessage([name, tp(s1), tp(s2), tp(s3)]);
}

function tp(str){
    return !isNaN(parseFloat(str)) ? parseFloat(str) : str;
}

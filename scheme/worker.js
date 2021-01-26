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
        clear_tbuf();
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

const BUFFER_AMT = 500; //how many commands
const CMD_LEN = 4; //floats per command
let turtle_commands_buffer = new Float64Array(BUFFER_AMT*CMD_LEN);
let buffer_idx = 0;

function clear_tbuf(){
    if(buffer_idx == 0) return;
    postMessage(["turtle", buffer_idx/CMD_LEN, turtle_commands_buffer.buffer], 
                [turtle_commands_buffer.buffer]);
    turtle_commands_buffer = new Float64Array(BUFFER_AMT*CMD_LEN);
    buffer_idx = 0;
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
    clear_tbuf();
    postMessage(["display",s]);
}


function turtle_cmd(name, s1, s2, s3){
    if(buffer_idx > CMD_LEN*(BUFFER_AMT-1)) clear_tbuf();
    turtle_commands_buffer[buffer_idx] = name; buffer_idx++;
    turtle_commands_buffer[buffer_idx] = s1;   buffer_idx++;
    turtle_commands_buffer[buffer_idx] = s2;   buffer_idx++;
    turtle_commands_buffer[buffer_idx] = s3;   buffer_idx++;
}

const HTML_COLORS = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff","beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000",
"blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887","cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e",
"coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff","darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b",
"darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f","darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000",
"darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1","darkviolet":"#9400d3","deeppink":"#ff1493",
"deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff","firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff","gainsboro":"#dcdcdc",
"ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f","honeydew":"#f0fff0","hotpink":"#ff69b4","indianred":"#cd5c5c",
"indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c","lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6",
"lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa",
"lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de","lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6","magenta":"#ff00ff",
"maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
"mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
"navajowhite":"#ffdead","navy":"#000080","oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6","palegoldenrod":"#eee8aa",
"palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd",
"powderblue":"#b0e0e6","purple":"#800080","rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1","saddlebrown":"#8b4513","salmon":"#fa8072",
"sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa",
"springgreen":"#00ff7f","steelblue":"#4682b4","tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0","violet":"#ee82ee","wheat":"#f5deb3",
"white":"#ffffff","whitesmoke":"#f5f5f5","yellow":"#ffff00","yellowgreen":"#9acd32",

"darkgrey":"#a9a9a9","darkslategrey":"#2f4f4f","dimgrey":"#696969","grey":"#808080","lightgrey":"#d3d3d3","lightslategrey":"#778899","slategrey":"#708090",
"darkgray":"#a9a9a9","darkslategray":"#2f4f4f","dimgray":"#696969","gray":"#808080","lightgray":"#d3d3d3","lightslategray":"#778899","slategray":"#708090"
};
function color_to_num(cstr){
	if (typeof HTML_COLORS[cstr.toLowerCase()] != 'undefined')
        cstr = HTML_COLORS[cstr.toLowerCase()];
	if(cstr.length != 7) return NaN;
    if(cstr[0] != "#") return NaN;
    return parseInt(cstr.substring(1),16);
}


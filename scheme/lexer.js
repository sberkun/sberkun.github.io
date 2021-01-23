
let global_token_types;
let global_token_vals;
let global_token_idx;

//[3,   8,  8,  1,    5,      6,     9,  8,    4,       7,      7,      3,  9,  9,     7,    8,                5,                 9 ]
//["b", "(","(","#t","3000", "2.179",")","(","cheese","quote","unquote","a",")",")","quote", "(","123456789012345678901234567890",")" ]

function next_token_type(){
    return global_token_types[global_token_idx];
}

function next_token(){
    let res = global_token_vals[global_token_idx];
    global_token_idx++;
    return res;
}

function push_token(s,t){
    global_token_types.push(t);
    global_token_vals.push(s);
}

//credit to whoever wrote the Python version of this code,
//and to Chenyang Yuan, who wrote the first javascript version of this code
//bulk of this comes from tokenizer.py in the cs61a scheme project
//I like cheese

//const NUMERAL_STARTS     = ("0123456789" + "+-.").split(''); //i hate this it is banished
const DIGITS             = ("0123456789").split(''); //this is better
const SYMBOL_CHARS       = ("0123456789" + "+-." +
                            "!$%&*/:<=>?@^_~" + 
                            "abcdefghijklmnopqrstuvwxyz" +
                            "ABCDEFGHIJKLMNOPQRSTUVWXYZ").split('');
const STRING_DELIMS      = ('"').split('');
const WHITESPACE         = (" \t\n\r").split('');
const SINGLE_CHAR_TOKENS = ("()[]'`").split('');
const TOKEN_END          = WHITESPACE.concat(SINGLE_CHAR_TOKENS).concat(STRING_DELIMS).concat([',',',@']);
//const DELIMITERS         = SINGLE_CHAR_TOKENS.concat(['.',',',',@']);
//not doing the variatic thing, sorry, too complicated


//do conversion here, instead of in the parser
const WRAPPING_TOKENS = {
    "'" :"quote",
    "`" :"quasiquote",
    "," :"unquote",
    ",@":"unquote-splicing"
};

function valid_symbol(s){
    if(s.length == 0) return false;
    for(let a=0;a<s.length;a++)
        if(!SYMBOL_CHARS.includes(s[a])) return false;
    return true;
}

function num_periods(text){
    return (text.match(/\./g)||[]).length;
}

function valid_num(text){
    if(text[0]=="+" || text[0]=="-") text = text.substring(1);
    if(text.length===0) return false;
    if(num_periods(text)>1) return false;
    for(let a=0;a<text.length;a++)
        if(!DIGITS.includes(text[a]) && text[a]!=".") return false;
    return true;
}

function valid_int(text){
    return valid_num(text) && num_periods(text) == 0;
}

function valid_float(text){
    return valid_num(text) && num_periods(text) == 1;
}


//I concede that this section is a mess
function next_candidate_token(line, k){
/*  A tuple [tok, k'], where tok is the next substring of line at or
    after position k that could be a token (assuming it passes a validity
    check), and k' is the position in line following that token.  Returns
    [null, line.length] when there are no more tokens. */
    while(k < line.length){
        let c = line[k];
        if(c==';') 
            return [null, line.length];
        else if(WHITESPACE.includes(c))
            k += 1;
        else if(SINGLE_CHAR_TOKENS.includes(c)){
            if(c=="]") c = ")";
            if(c=="[") c = "(";
            return [c, k+1];
        }
        else if(c=="#") //booleans #t and #f
            return [line.substring(k,k+2), Math.min(k+2, line.length)];
        else if(c==",") // check to see if , or ,@
            return (line[k+1]=='@')? [',@', k+2] : [c, k+1];
        else if(STRING_DELIMS.includes(c)){
            let j = k+1;
            let res = c;
            while(j < line.length){
                if(STRING_DELIMS.includes(line[j]))
                    return [res+line[j], j+1];
                if(line[j] == "\\") {
                    j += 1;
                    switch(line[j]){
                        case '"': res += '"'; break;
                        case "\\": res += "\\"; break;
                        case "n": res += "\n"; break;
                        case "t": res += "\t"; break;
                        case "r": res += "\r"; break;
                        default:  res += line[j];
                    }
                } else {
                    res += line[j];
                }
                j += 1;
            }
            return [line.substring(k,j)+" ", j]; //its a malformed string here, extra space is for if it ends in \"
        }
        else{
            let j=k;
            while(j<line.length && !TOKEN_END.includes(line[j])) j++;
            return [line.substring(k,j),j];
        }
    }
    return [null, line.length];
}


//a token type is an int that indicates what type of token it is
// 0 - None
// 1 - true
// 2 - false
// 3 - symbol
// 4 - string (does not include the wrapping " " )
// 5 - int
// 6 - float
// 7 - wrapping token, like quote, quasiquote, unquote, unquote splicing
// 8 - open parenthesis. Unfortunately, I don't have time to deal with mismatched brackets, so all brackets will just be converted to parenthesis
// 9 - closing parethesis

function tokenize_line(line) {
    let result_strs = [];
    let result_types = [];
    let nt = next_candidate_token(line, 0);
    let text = nt[0];
    let i = nt[1];
    while(text !== null){
        //if text in DELIMITERS - too complicated not doing variatic function stuff
        if(text == "#t" || text.toLowerCase() == "true"){
            push_token("#t",1);
        }
        else if(text == "#f" || text.toLowerCase() == "false"){
            push_token("#f",2);
        }
        else if(text.toLowerCase() == "nil"){
            push_token("(",8);
            push_token(")",9);
        }
        else if(STRING_DELIMS.includes(text[0])){
            if(text.length >= 2 && STRING_DELIMS.includes(text[text.length - 1]))
                push_token(text.substring(1,text.length - 1),4);
            else {
                display("ParseError: invalid string: "+text);
                return false; //errored out
            }
        }
        else if(valid_int(text)){
            push_token(text,5);
        }
        else if(valid_float(text)){
            push_token(text,6);
        }
        else if(text=="("){
            push_token("(",8);
        }
        else if(text==")"){
            push_token(")",9);
        }
        else if(WRAPPING_TOKENS[text]){
            push_token(WRAPPING_TOKENS[text], 7);
        }
        else if(valid_symbol(text)){
            push_token(text.toLowerCase(),3);
        }
        else {
            display("ParseError: invalid token: "+text);
            return false; //errored out
        }
        
        nt = next_candidate_token(line, i);
        text = nt[0];
        i = nt[1];
    }
    
    return true;
}


function tokenize_lines(src) {
    global_token_types = [];
    global_token_vals = [];
    global_token_idx = 0;
    
    let lines = src.split("\n");
    for(let a=0;a<lines.length;a++){
        if(!tokenize_line(lines[a])) return false;
    }

    return true;
}

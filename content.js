
function changeColors(bg_color, text_color, s_color) {
    document.documentElement.style.setProperty('--bg-color', bg_color);
    document.documentElement.style.setProperty('--text-color', text_color);
    document.documentElement.style.setProperty('--secondary-text-color', s_color);
}
function changeToLight() {
    changeColors("#ffffff", "#4a4a4a", "#80858f");
    localStorage.setItem("color_mode", "light");
    document.getElementById("color-mode-btn").innerText = "dark mode";
    document.getElementById("color-mode-btn").onclick = function(e) {
        e.preventDefault();
        changeToDark();
    };
}
function changeToDark() {
    changeColors("#1e2329", "#adbac7", "#757575");
    localStorage.setItem("color_mode", "dark");
    document.getElementById("color-mode-btn").innerText = "light mode";
    document.getElementById("color-mode-btn").onclick = function(e) {
        e.preventDefault();
        changeToLight();
    };
}
var savedMode = localStorage.getItem("color_mode");
if(savedMode === "light") {
    changeToLight();
} else { //dark is default
    changeToDark();
}





let GLOBAL_USE_HTML = false;
document.getElementById("inpform").onsubmit = function(e) {
    e.preventDefault();
    if(this.inp.value !== "") {
        GLOBAL_USE_HTML = false;
        changeText(findResponse(this.inp.value));
        this.inp.value = "";
    }
};

function findResponse(input) {
    input = input.trim();
    let sanitized = input.split(/\W/).join(" ").toLowerCase().trim();
    for (let res of responses) {
        let matched = (res[0] == INC && (sanitized + " ").includes(res[1] + " ") && (" " + sanitized).includes(" " + res[1])) ||
                      (res[0] == EX && sanitized == res[1]) ||
                      (res[0] == SW && sanitized.startsWith(res[1]));
        if (matched) {
            if(typeof res[2] == "string") {
                return res[2];
            } else {
                let cool = res[2](input);
                if(typeof cool != "undefined") {
                    return cool;
                }
                return "loading...";
            }
        }
    }
    GLOBAL_USE_HTML = true;
    let retEl = document.createElement("div");
    retEl.innerHTML = "Sorry, I didn't understand that. You can type \"help\" for some examples,"+
        " or go to my <a href=\"/about.html\">profile</a> or <a href=\"projects.html\">project</a> pages to learn more about me.";
    return retEl;
}


function changeText(s) {
    document.getElementById("inner").innerHTML = "";
    if(GLOBAL_USE_HTML) {
        document.getElementById("inner").appendChild(s);
    } else {
        document.getElementById("inner").innerText = s;
    }
}

const EX = 0; //exact match
const SW = 1; //starts with
const INC = 2; //includes
const responses = [
    [SW, "echo", (i) => i.substring(i.toLowerCase().indexOf("echo")+4)],
    [SW, "ls", "cheese.txt\ncheese2.txt\n.gitlet"],
    [SW, "top", "top: command not found"],
    [SW, "htop", "htop: command not found"],
    [EX, "something", "Well, that certainly is something."],
    [SW, "cd", (i) => "cd:" + i.substring(i.toLowerCase().indexOf("cd")+2) + ": Permission denied"],
    [SW, "rm", "Successfully deleted everything!"],
    [SW, "go to", (i) => {location.href = i.substring(i.toLowerCase().indexOf("to")+2);}],
    [SW, "goto", (i) => {location.href = i.substring(i.toLowerCase().indexOf("to")+2);}],
    [INC, "cheese", cheeseFunction],
    [INC, "help", "Here are some example commands you can try out:\nhelp\necho [something]\npython\ncheese\nprojects"],
    [INC, "hi", "Hi! Nice to meet you :)"],
    [INC, "hello", "Hello! Nice to meet you :)"],
    [INC, "bio", "Hi! I'm a student at UC Berkeley who likes eating cheese. If you would like to learn more about me, you can visit my about page by typing \"about\""],
    [INC, "quote", quoteFunction],
    [INC, "pong", pongFunction],
    [SW, "py", pythonFunction],
    [INC, "python", pythonFunction],
    [SW, "python2", pythonFunction],
    [SW, "python3", pythonFunction],
    [INC, "snake", pythonFunction],
    [INC, "pong", pongFunction],
    [INC, "shower", randomFunction], //shower thought
    [INC, "random", randomFunction],
    [INC, "ai", machinelearning("Artificial intelligence")],
    [INC, "ml", machinelearning("Machine learning")],
    [INC, "data", machinelearning("Big Data\u2122")],
    [INC, "artificial intelligence", machinelearning("Artificial intelligence")],
    [INC, "machine learning", machinelearning("Machine learning")],
    [INC, "light", (i) => {changeToLight(); return "light mode enabled!"}],
    [INC, "dark", (i) => {changeToDark(); return "dark mode enabled!"}],
    [INC, "wow", "I'm glad you like it!"],
    [INC, "cool", "I'm glad you like it!"],
    [INC, "profile", (i) => {location.href = "/about.html";}],
    [INC, "about", (i) => {location.href = "/about.html";}],
    [INC, "contact", (i) => {location.href = "/about.html";}],
    [INC, "projects", (i) => {location.href = "/projects.html";}],
    [INC, "project", (i) => {location.href = "/projects.html";}],
    [INC, "lesson", (i) => {location.href = "http://paulgraham.com/lesson.html";}],
];

let cheese_counter = 0;
function cheeseFunction(input) {
    cheese_counter++;
    if(cheese_counter == 8) {
        location.href = "https://www.cheese.com";
        return "serving up some cheese :)";
    }
    return "I like cheese!";
}

function pythonFunction(input) {
    console.log("unimplemented!");
    return "Coming soon!";
}

function pongFunction(input) {
    GLOBAL_USE_HTML = true;
    let myCanvas = document.createElement("canvas");
    myCanvas.style.width = "min(80vw, 80vh)";
    myCanvas.style["background-color"] = "black";
    myCanvas.onclick = startPong;

    let ctx = myCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(10.5, 10.5, 10, 10);

    return myCanvas;
}

function startPong() {


}


function machinelearning(which) {
    return which + " is a social construct, perputuated by data scientists "
        + "who believe that their linear algebra is superior to other people's"
        + " linear algebra just because they forced a computer to do it."
}

function randomFunction(input) {
    const thoughts = [
        "Being proactive is rarely rewarded, because if your actions avoid a tragedy, there is no tragedy to prove your actions were warranted.",
        "If a sloth were to clap, it will always sound sarcastic.",
        "When you're a kid, you don't realize you're also watching your mom and dad grow up.",
        "Pavlov probably thought about feeding his dogs every time someone rang a bell.",
        "\"Nate the Snake\" is a great story.",
        "In five thousand years, today's instruction manuals will be invaluable as Rosetta Stones: they contain the same text in 5-10 different languages.",
        "Thermometers are speedometers for atoms",
        "In real life, Goliath wins, and then sells all the silk that the widow spins.",
        "Monopoly would be more realistic if the person with the most money got to change the rules whenever they liked.",
        "Most people have an above-average number of eyes.",
        "A recursive centaur is half horse, half recursive centaur.",
        "Every 60 seconds in Africa, a minute passes."
    ];
    let res = thoughts[Math.floor(Math.random()*thoughts.length)];
    let words = input.split(/\s+/);
    if (words.length >= 3 && !isNaN(words[1]) && !isNaN(words[2])) {
        let r = parseFloat(words[2]) - parseFloat(words[1]);
        let s = parseFloat(words[1]);
        if(r % 1 == 0 && s % 1 == 0) {
            res += "\n" + Math.floor(Math.random()*r + s);
        } else {
            res += "\n" + (Math.random()*r + s);
        }
    } else if (words.length >= 2 && !isNaN(words[1])) {
        let r = parseFloat(words[1]);
        if (r % 1 == 0) {
            res += "\n" + Math.floor(Math.random()*r);
        } else {
            res += "\n" + (Math.random()*r);
        }
    }
    return res
}

function quoteFunction() {
    const thoughts = [
        ["The best time to start was yesterday. The second best time is now.", "unknown"],
        ["I like cheese", "me"],
        ["Give a man a mask and he will show you his true face.", "Oscar Wilde (paraphrased)"],
        ["When a measure becomes a target, it ceases to be a good measure.", "Maralyn Strathern (Goodhart's law)"],
        ["Don't believe everything you read on the internet", "Abraham Lincoln"],
    ];
    let choice = thoughts[Math.floor(Math.random()*thoughts.length)];
    return `"${choice[0]}" - ${choice[1]}`;
}




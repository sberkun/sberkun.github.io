import init, { Visualizer } from "../pkg/percolation.js";

let seed_string;
let vis;
let requested_frame = false;
let canvas;
let ctx;

export function set_canvas_size(w, h) {
  canvas.width = w;
  canvas.height = h;
}

export function request_animation_frame() {
  if (!requested_frame) {
    requested_frame = true;
    window.requestAnimationFrame(() => {
      requested_frame = false;
      vis.draw_animation_frame();
    });
  }
}

export function draw_rectangle(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function draw_text(text, x, y, color, font) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

export function set_bottom_text(text) {
  document.getElementById("bottom-text").innerText = text;
}

export function start() {
  init().then(() => {
      let iwi = document.getElementById("i-width-inp");
      let ihi = document.getElementById("i-height-inp");
      let swi = document.getElementById("s-width-inp");
      let shi = document.getElementById("s-height-inp");
      let sti = document.getElementById("s-trials-inp");
      let ibox = document.getElementById("interactive-box");
      let sbox = document.getElementById("stats-box");
      canvas = document.getElementById("main-canvas");
      ctx = canvas.getContext("2d");
      seed_string = "" + new Date().getTime() + Math.random();
      vis = Visualizer.new(iwi.value, ihi.value, seed_string);
      
      document.getElementById("interactive-btn").onclick = () => {
        sbox.style.display = "none";
        ibox.style.display = "block";
        vis.start_interactive(iwi.value, ihi.value);
      }

      document.getElementById("interactive-btn-2").onclick = () => {
        vis.start_interactive(iwi.value, ihi.value);
      }

      document.getElementById("random-btn").onclick = () => {
        sbox.style.display = "none";
        ibox.style.display = "none";
        let pictures = [
"greeting57.txt",  "input1-no.txt",  "input2.txt",   "input5.txt",       "input8-no.txt",  "sedgewick60.txt",  "snake501.txt",
"heart25.txt",     "input1.txt",     "input3.txt",   "input6.txt",       "input8.txt",     "snake1001.txt",    "wayne98b.txt",
"input10-no.txt",  "input20.txt",    "input4.txt",   "input7.txt",       "jerry47.txt",    "snake101.txt",     "wayne98.txt",
"input10.txt",     "input2-no.txt",  "input50.txt",  "input8-dups.txt",  "michael61.txt",  "snake13.txt",
        ]
        let rand_index = Math.floor(Math.random() * pictures.length);
        console.log("fetching random picture" + pictures[rand_index]);
        fetch("./public/pictures/" + pictures[rand_index]).then(r => r.text()).then((t) => {
            vis.start_picture(t);
        })
      }

      document.getElementById("stats-btn").onclick = () => {
        ibox.style.display = "none";
        sbox.style.display = "block";
        vis.start_stats(swi.value, shi.value, sti.value);
      }

      document.getElementById("stats-btn-2").onclick = () => {
        vis.start_stats(swi.value, shi.value, sti.value);
      }



      canvas.onmousemove = (ev) => {
        if (ev.buttons & 1 == 1) { // primary button pressed
            vis.respond_to_mousedown(ev.offsetX, ev.offsetY);
        }
      }
      canvas.onclick = (ev) => {
        vis.respond_to_mousedown(ev.offsetX, ev.offsetY);
      }
  });
}


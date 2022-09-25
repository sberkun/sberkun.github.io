
let wasm;

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}
/**
*/
export class Visualizer {

    static __wrap(ptr) {
        const obj = Object.create(Visualizer.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_visualizer_free(ptr);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @param {string} seed
    * @returns {Visualizer}
    */
    static new(width, height, seed) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.visualizer_new(width, height, ptr0, len0);
        return Visualizer.__wrap(ret);
    }
    /**
    * @param {number} width
    * @param {number} height
    */
    start_interactive(width, height) {
        wasm.visualizer_start_interactive(this.ptr, width, height);
    }
    /**
    * @param {string} input
    */
    start_picture(input) {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.visualizer_start_picture(this.ptr, ptr0, len0);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @param {number} trials
    */
    start_stats(width, height, trials) {
        wasm.visualizer_start_stats(this.ptr, width, height, trials);
    }
    /**
    * @param {number} x
    * @param {number} y
    */
    respond_to_mousedown(x, y) {
        wasm.visualizer_respond_to_mousedown(this.ptr, x, y);
    }
    /**
    */
    draw_animation_frame() {
        wasm.visualizer_draw_animation_frame(this.ptr);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_drawrectangle_c5410e671a37ee5a = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        draw_rectangle(arg0, arg1, arg2, arg3, getStringFromWasm0(arg4, arg5));
    };
    imports.wbg.__wbg_drawtext_2343e1a5ded7a384 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        draw_text(getStringFromWasm0(arg0, arg1), arg2, arg3, getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
    };
    imports.wbg.__wbg_setbottomtext_8fa601c7cb543391 = function(arg0, arg1) {
        set_bottom_text(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_log_e0f0bbada0ef08d4 = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_setcanvassize_e384bb3ba1c8baf2 = typeof set_canvas_size == 'function' ? set_canvas_size : notDefined('set_canvas_size');
    imports.wbg.__wbg_requestanimationframe_5972ea69d7d0d7c9 = typeof request_animation_frame == 'function' ? request_animation_frame : notDefined('request_animation_frame');
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedUint8Memory0 = new Uint8Array();


    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('percolation_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;

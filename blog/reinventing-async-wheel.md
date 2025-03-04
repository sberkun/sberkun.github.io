# Re-inventing the Async Wheel

Everyone complains about async Rust. It's complicated, unintuitive, introduces function coloring, and (subjectively) ugly under the hood. So the natural question to ask is "can we do better?". This is a hard question to answer; naturally, there is a huge selection of tradeoffs to consider. Many attempts to answer the question have been made, to varying degrees of subjective reader satisfaction.

But what I want to know is, can we do worse? Can we make an async system that is even _more_
complicated, and unintuitive, and (as objectively as possible) ugly under the hood? Of course, there should be some kind of upside; maybe a tiny bit of performance, or some increased generality. After all, it wouldn't be much of a frustrating system if there was no reason to use it.


## The goals

If we want to beat the performance of the current async system, we should first examine what the current system tries to achieve. Some strengths that come to mind are:
 - it can be lightweight (memory and overhead-wise)
 - it can handle very large numbers of concurrent tasks
 - it can work with different runtimes

The third point is pretty fundamental. A language like Go can get away with a single runtime because its used to write web servers and only web servers. A language like Rust needs a concurrency system that not only work for web servers, but also embedded systems, kernel drivers, and other use cases where a heavyweight runtime is simply not an option. So it's pretty important that the runtime can be a simple polling loop, or a giant fancy work-stealing scheduler, or something in between.

However, in my opinion, the current system falls slightly short. While different runtimes do exist, they're not "swappable". If you write async code for the Tokio runtime, it won't work with any other runtime; switching to monoio, for example, will require significant changes. In a perfect world, there would be some way to decouple to async code from the async runtime, so that trying out different runtimes could be as simple as a one-line code change. 

[TODO: look into async std]






## Starting point: Let's copy Javascript

Imagine yourself as the designer of a fresh, brand-new system for async functions in Rust. How would you approach this?

Personally, I would first look at a proven, well-established language like Javascript to see how they handle it. Javascript async actually started life as a series of callbacks, such as

```javascript
function loadData() {
    console.log("loading...");
    // wait a few seconds to make it feel like something is happening
    setTimeout(() => {
        console.log("loaded!");
    }, 2000);
}
```

Javascript later added Promises and async/await, but they fundamentally desugar to callbacks. Can we accomplish something similar in Rust?

```rust

fn sleep<F: FnOnce()>(ms: u32, callback: f) {...}

fn load_data() {
    println!("loading...");
    // wait a few seconds to make it feel like something is happening
    sleep(2000, ||{
        println!("loaded!");
    });
}
```

This looks promising. If we want to make it composable, we can emulate continuation passing style, like so:

```rust

fn sleep<F: FnOnce()>(ms: u32, callback: f) {...}

// loads some bytes
fn load_data<F: FnOnce(Vec<u8>)>(callback: f) {
    println!("loading...");
    // wait a few seconds to make it feel like something is happening
    sleep(2000, ||{
        let fake_data: Vec<u8> = vec![0; 128];
        println!("loaded!");
        callback(fake_data);
    });
}
```

Now, someone can use `load_data` as an async function the same way we used `sleep` as an async function. If we implemented some macros, perhaps we can get the following syntax:

```rust

#[async_fn]
fn sleep(ms: u32) {...}

#[async_fn]
fn load_data() -> Vec<u8> {
    println!("loading...");
    // wait a few seconds to make it feel like something is happening
    await!(sleep(2000));
    let fake_data: Vec<u8> = vec![0; 128];
    println!("loaded!");
    fake_data
}
```

This looks great! However, we now have a fairly large hurdle: how do we implement `sleep`? More generally, how do we implement a runtime?

One idea is for sleep to store the callback in some global task queue. 


 - problem: need to box the savestate every time
 - dynamic allocations bad!
 - solution? have future specify some type that is large enough to hold savestates
 - enter `machines.rs`
 - problem: pin
 - enter `wheel.rs`
 - problem: api in `wheel.rs` is really really bad
 - no solution
# Functions Should Have Types

Suppose you have a function that takes a callback. In Rust, you might write it like so:

```rust
fn calculate<F: Fn(i32) -> i32>(callback: F) {
    println!("result: {}", callback(42));
}
```

Using this function is fairly easy:
```rust
let my_callback = |n: i32| n * 2;
calculate(my_callback);
```

However, there is a bit of a disconnect here. 
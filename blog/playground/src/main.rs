mod runtime_trait;
mod wheel;

fn main() {
    let callback = |n: i32| n * 2;
    calculate(callback);
    calculate2(callback);
}

fn calculate<F: Fn(i32) -> i32>(callback: F) {
    println!("result: {}", callback(5));
}

fn calculate2(callback: impl Fn(i32) -> i32) {

}
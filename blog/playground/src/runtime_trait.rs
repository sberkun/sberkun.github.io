



// TODO: make unconstructable?
struct InnerToken();

pub struct Token(InnerToken);

/*
pub trait AsyncContext {
    async fn sleep_until(time: u64);
    async fn read_file(file_name: &str, start_idx: usize, buf: &mut [u8]) -> usize;
}
*/
pub trait AsyncContext: Sized {
    fn sleep_until<F: FnOnce(Self) -> Token>(self, time: u64, cont: F) -> Token;
    fn read_file<F: FnOnce(Self, usize) -> Token>(self, file_name: &str, start_idx: usize, buf: &mut [u8], cont: F) -> Token;
}




fn current_time() -> u64 {
    todo!()
}

/*
async fn print_twice(message: &str, interval: u64) {
    println!("first {message}");
    let t = current_time() + interval;
    sleep_until(t);
    println!("second {message}");
}
*/
fn print_twice<C: AsyncContext, F: FnOnce(C) -> Token>(ctx: C, cont: F, message: &str, interval: u64) -> Token {
    println!("first {message}");
    let t = current_time() + interval;
    ctx.sleep_until(t, |ctx: C| {
        println!("{message}");
        cont(ctx)
    })
}



/*
async fn read_whole_file(file_name: &str) -> Vec<u8> {
    let buf = Vec::new(10);
    let used: usize = 0;
    loop {
        let read = read_file(file_name, used, buf).await;
        if (read < buf.len())
    }


}
*/

fn read_whole_file<C: AsyncContext, F: FnOnce(C, Vec<u8>) -> Token>(ctx: C, cont: F, file_name: &str) -> Token {
    todo!()
}


/*

///////////////////////////////////////////////////////

Attempt 2

///////////////////////////////////////////////////////

*/

pub trait Continuation<T> {
    fn run(self, return_val: T) -> Token;
}


pub trait Future<A: AsyncContext> {
    fn run(self, a: A) -> Token;
}

/*

///////////////////////////////////////////////////////

Attempt 3 is in wheel

///////////////////////////////////////////////////////

*/

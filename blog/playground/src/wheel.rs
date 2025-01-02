

struct Token {}

struct Ticket(u64);



pub trait AsyncContext<T> {
    fn sleep(self, ns: usize, callback: fn(Self, &mut T) -> Token) -> Token;
    fn u32toi32(self, inp: u32, callback: fn(Self, &mut T, i32) -> Token) -> Token;
}



/// upper "large data object" needs a method to get the inner MyFuture
/// and needs a callback to process final return type

pub trait Extractor<AC, I: ?Sized, Out> where AC: AsyncContext<Self::T> {
    type T; // outer future type
    fn extract(t: &mut Self::T) -> &mut I;
    fn continuation(ctx: AC, t: &mut Self::T, output: Out) -> Token;
}


pub trait Future<AC, E> where AC: AsyncContext<E::T>, E: Extractor<AC, Self, Self::Out> {
    type Inp; // input type
    type Out; // output type
    fn start(ctx: AC, outer: &mut E::T, inp: Self::Inp) -> Token;
}


struct InnerFuture {}


impl<AC: AsyncContext<E::T>, E: Extractor<AC, InnerFuture, i32>> Future<AC, E> for InnerFuture {
    type Inp = u32;

    type Out = i32;

    fn start(ctx: AC, outer: &mut E::T, inp: u32) -> Token {
        let _cheese = E::extract(outer);
        // do stuff

        ctx.u32toi32(inp, Self::after_wait::<AC, E>)
    }
}

impl InnerFuture {
    fn new() -> InnerFuture {
        InnerFuture{}
    }
    fn after_wait<AC: AsyncContext<E::T>, E: Extractor<AC, InnerFuture, i32>>(ctx: AC, outer: &mut E::T, inp: i32) -> Token {
        // do stuff
        
        E::continuation(ctx, outer, inp)
    }
}







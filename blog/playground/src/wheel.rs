

struct Token {}

struct Ticket(u64);



pub trait AsyncContext {
    fn noop(self, callback: fn(Self) -> Token) -> Token;
    fn sleep(self, ns: usize, callback: fn(Self) -> Token) -> Token;
    fn u32toi32(self, inp: u32, callback: fn(Self, i32) -> Token) -> Token;
}

pub trait Extractor<AC, I: ?Sized, Out> {
    fn extract(ctx: &mut AC) -> &mut I;
    fn continuation(ctx: AC, output: Out) -> Token;
}

pub trait Future<AC, E> where E: Extractor<AC, Self, Self::Out> {
    type Inp; // input type
    type Out; // output type
    fn start(ctx: AC, inp: Self::Inp) -> Token;
}


struct InnerFuture {}


impl<AC: AsyncContext, E: Extractor<AC, Self, i32>> Future<AC, E> for InnerFuture {
    type Inp = u32;

    type Out = i32;

    fn start(mut ctx: AC, inp: u32) -> Token {
        Self::step1::<AC, E>(ctx, inp)
    }
}

impl InnerFuture {
    fn new() -> InnerFuture {
        InnerFuture{}
    }

    fn step1<AC: AsyncContext, E: Extractor<AC, Self, i32>>(mut ctx: AC, inp: u32) -> Token {
        let _cheese = E::extract(&mut ctx);
        // do stuff

        ctx.u32toi32(inp, Self::step2::<AC, E>)
    }

    fn step2<AC: AsyncContext, E: Extractor<AC, Self, i32>>(ctx: AC, inp: i32) -> Token {
        // do stuff
        
        E::continuation(ctx, inp)
    }
}


/*

struct OuterFuture {
    cheese: u32,
    a: InnerFuture,
    b: InnerFuture
}


struct EA<E> {
    inner: E
}
impl<AC, E> Extractor<AC, InnerFuture, i32> for EA<E>
    where E: Extractor<AC, OuterFuture, ()> {
    fn extract(ctx: &mut AC) -> &mut InnerFuture {
        todo!()
    }

    fn continuation(ctx: AC, output: i32) -> Token {
        todo!()
    }
}


impl<AC: AsyncContext, E: Extractor<AC, Self, ()>> Future<AC, E> for OuterFuture {
    type Inp = u32;

    type Out = ();

    fn start(ctx: AC, inp: Self::Inp) -> Token {
        Self::step1::<AC, E>(ctx, inp)
    }
}

impl OuterFuture {
    fn step1<AC: AsyncContext, E: Extractor<AC, Self, ()>>(mut ctx: AC, inp: u32) -> Token {
        E::extract(&mut ctx).cheese = inp;

        struct E2 {}
        impl<AC> Extractor<AC, InnerFuture, i32> for E2 {
            fn extract(ctx: &mut AC) -> &mut InnerFuture {
                todo!()
            }
        
            fn continuation(ctx: AC, output: i32) -> Token {
                todo!()
            }
        }


        <InnerFuture as Future<AC, E>>::start(ctx, inp)
    }

}

 */

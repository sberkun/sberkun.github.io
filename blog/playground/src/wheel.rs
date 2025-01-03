

pub struct Token {}


pub trait BasicAsyncTask {
    fn noop(self, callback: fn(Self) -> Token) -> Token;
    fn sleep(self, ns: usize, callback: fn(Self) -> Token) -> Token;
    fn u32toi32(self, inp: u32, callback: fn(Self, i32) -> Token) -> Token;
}

pub trait Extractor<T, F: Future<T> + ?Sized> {
    fn extract(task: &mut T) -> &mut F;
    fn continuation(task: T, output: F::Out) -> Token;
}

pub trait Future<T> {
    type Inp; // input type
    type Out; // output type
    fn start<E: Extractor<T, Self>>(task: T, inp: Self::Inp) -> Token;
}


struct InnerFuture {}


impl<T: BasicAsyncTask> Future<T> for InnerFuture {
    type Inp = u32;

    type Out = i32;

    fn start<E: Extractor<T, Self>>(task: T, inp: u32) -> Token {
        Self::step1::<T, E>(task, inp)
    }
}

impl InnerFuture {
    fn new() -> InnerFuture {
        InnerFuture{}
    }

    fn step1<T: BasicAsyncTask, E: Extractor<T, Self>>(mut task: T, inp: u32) -> Token {
        let _cheese = E::extract(&mut task);
        // do stuff

        task.u32toi32(inp, Self::step2::<T, E>)
    }

    fn step2<T: BasicAsyncTask, E: Extractor<T, Self>>(task: T, inp: i32) -> Token {
        // do stuff
        
        E::continuation(task, inp)
    }
}




struct OuterFuture {
    cheese: u32,
    a: InnerFuture,
    b: InnerFuture
}


impl<T: BasicAsyncTask> Future<T> for OuterFuture {
    type Inp = u32;

    type Out = ();

    fn start<E: Extractor<T, Self>>(mut task: T, inp: Self::Inp) -> Token {
        E::extract(&mut task).cheese = inp;
        InnerFuture::start::<EA<E>>(task, inp)
    }
}

struct EA<E>(E);
impl<T: BasicAsyncTask, E: Extractor<T, OuterFuture>> Extractor<T, InnerFuture> for EA<E> {
    fn extract(task: &mut T) -> &mut InnerFuture {
        &mut E::extract(task).a
    }

    fn continuation(mut task: T, output: i32) -> Token {
        println!("a {output}");
        let cheese = E::extract(&mut task).cheese;
        InnerFuture::start::<EB<E>>(task, cheese)
    }
}

struct EB<E>(E);
impl<T: BasicAsyncTask, E: Extractor<T, OuterFuture>> Extractor<T, InnerFuture> for EB<E> {
    fn extract(task: &mut T) -> &mut InnerFuture {
        &mut E::extract(task).b
    }

    fn continuation(task: T, output: i32) -> Token {
        println!("b {output}");
        E::continuation(task, ())
    }
}

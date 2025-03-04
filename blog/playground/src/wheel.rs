

/**
 * 
 * Comments 3/2/2025
 * 
 * go back to T -> Token setup
 *    - embedding includes callback
 * use type Parallel<F1, F2> to handle simultanious calls
 *     - idk if there's a solution to "static # parallelism"
 * 
 * pin embedding: &mut T -> Pin<&mut self>
 * T is a wrapper around Pin<&mut something> under the hood
 * 
 * still not reaaaly safe. possible things that could go wrong
 *     - runtime could call callback twice
 *     - forget to do setup before calling inner future (since raw unions)
 * 
 */


pub trait Embedding<T: ?Sized, F: ?Sized> {
    fn extract(task: &mut T) -> &mut F;
}

pub trait Future<T: ?Sized, I, O> {
    fn start<E: Embedding<T, Self>, F: FnOnce(O)>(task: &mut T, inp: I, continuation: F);
}

pub trait BasicAsyncTask {
    type NoopFT: Default + Future<Self, (), ()>;
    type Sleep: Default + Future<Self, usize, ()>;
    type U32ToI32: Default + Future<Self, u32, i32>;
}

struct InnerFuture<T: BasicAsyncTask> {
    tt: T::U32ToI32
}

impl<T: BasicAsyncTask> Future<T, u32, i32> for InnerFuture<T> {
    fn start<E: Embedding<T, Self>, F: FnOnce(i32)>(task: &mut T, inp: u32, continuation: F) {
        let _cheese = E::extract(task);
    }
}



/*

struct InnerFuture<T: BasicAsyncTask> {
    tt: T::U32ToI32
}

impl<T: BasicAsyncTask> Future<T, u32, i32> for InnerFuture<T> {
    fn start<E: Embedding<T, Self, i32>>(task: &mut T, inp: u32) {
        let _cheese = E::extract(task);
        // do stuff

        T::U32ToI32::start::<IFE<E>>(task, inp);
    }
}

struct IFE<E>(E);
impl<T: BasicAsyncTask, E: Embedding<T, InnerFuture<T>, i32>> Embedding<T, T::U32ToI32, i32> for IFE<E> {
    fn extract(task: &mut T) -> &mut T::U32ToI32 {
        &mut E::extract(task).tt
    }

    fn continuation(task: &mut T, output: i32) {
        let _cheese = E::extract(task);

        E::continuation(task, output);
    }
}

 */


/*


struct OuterFuture {
    cheese: u32,
    a: InnerFuture,
    b: InnerFuture
}


impl<T: BasicAsyncTask> Future<T> for OuterFuture {
    type Inp = u32;

    type Out = ();

    fn start<E: Extractor<T, Self>>(task: &mut T, inp: Self::Inp) {
        E::extract(task).cheese = inp;
        InnerFuture::start::<EA<E>>(task, inp)
    }
}

struct EA<E>(E);
impl<T: BasicAsyncTask, E: Extractor<T, OuterFuture>> Extractor<T, InnerFuture> for EA<E> {
    fn extract(task: &mut T) -> &mut InnerFuture {
        &mut E::extract(task).a
    }

    fn continuation(task: &mut T, output: i32) {
        println!("a {output}");
        let cheese = E::extract(task).cheese;
        InnerFuture::start::<EB<E>>(task, cheese)
    }
}

struct EB<E>(E);
impl<T: BasicAsyncTask, E: Extractor<T, OuterFuture>> Extractor<T, InnerFuture> for EB<E> {
    fn extract(task: &mut T) -> &mut InnerFuture {
        &mut E::extract(task).b
    }

    fn continuation(task: &mut T, output: i32) {
        println!("b {output}");
        E::continuation(task, ())
    }
}



struct CheeseTask<F> {
    f: F
}

struct CheeseE {}

impl<F: Future<CheeseTask<F>>> Extractor<CheeseTask<F>, F> for CheeseE {
    fn extract(task: &mut CheeseTask<F>) -> &mut F {
        &mut task.f
    }

    fn continuation(task: &mut CheeseTask<F>, output: F::Out) {
        println!("task finished!")
    }
}

impl<F> BasicAsyncTask for CheeseTask<F> {
    fn noop(&mut self, callback: fn(&mut Self)) {
        todo!()
    }

    fn sleep(&mut self, ns: usize, callback: fn(&mut Self)) {
        todo!()
    }

    fn u32toi32(&mut self, inp: u32, callback: fn(&mut Self, i32)) {
        todo!()
    }
}

impl<F: Future<CheeseTask<F>>> CheeseTask<F> {
    fn new(f: F) -> CheeseTask<F> {
        CheeseTask { f }
    }
}

fn woiefj() {
    let mut task= CheeseTask::new(InnerFuture {});
    InnerFuture::start::<CheeseE>(&mut task, 212312);
}


mod builtins {
    use super::{BasicAsyncTask, Extractor, Future};


    struct NoopFuture {}
    impl<T: BasicAsyncTask> Future<T> for NoopFuture {
        type Inp = ();
        type Out = ();
        fn start<E: Extractor<T, Self>>(task: &mut T, _: ()) {
            task.noop(|t| E::continuation(t, ()));
        }
    }

    struct SleepFuture {}
    impl<T: BasicAsyncTask> Future<T> for SleepFuture {
        type Inp = usize;
        type Out = ();
        fn start<E: Extractor<T, Self>>(task: &mut T, inp: usize) {
            task.sleep(inp, |t| E::continuation(t, ()));
        }
    }

    struct U32I32Future {}
    impl<T: BasicAsyncTask> Future<T> for U32I32Future {
        type Inp = u32;
        type Out = i32;
        fn start<E: Extractor<T, Self>>(task: &mut T, inp: u32) {
            task.u32toi32(inp, E::continuation);
        }
    }



}

*/
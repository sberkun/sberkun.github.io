


pub trait BasicAsyncTask {
    fn noop(&mut self, callback: fn(&mut Self));
    fn sleep(&mut self, ns: usize, callback: fn(&mut Self));
    fn u32toi32(&mut self, inp: u32, callback: fn(&mut Self, i32));
}


// pub trait BetterAsyncTask: Sized {
//     type NoopFT: Future<Self> where NoopTF::Inp = (), NoopFT::Out = ();
// }


pub trait Extractor<T, F: Future<T> + ?Sized> {
    fn extract(task: &mut T) -> &mut F;
    fn continuation(task: &mut T, output: F::Out);
}

pub trait Future<T> {
    type Inp; // input type
    type Out; // output type
    fn start<E: Extractor<T, Self>>(task: &mut T, inp: Self::Inp);
}


struct InnerFuture {}


impl<T: BasicAsyncTask> Future<T> for InnerFuture {
    type Inp = u32;

    type Out = i32;

    fn start<E: Extractor<T, Self>>(task: &mut T, inp: u32) {
        let _cheese = E::extract(task);
        // do stuff

        task.u32toi32(inp, |t, a| {
            let _ewiorfj = E::extract(t);
            // do stuff

            E::continuation(t, a)
        })
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
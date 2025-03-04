use std::pin::Pin;


// we have to "trust" that the Task given to us in the callback is the
// is the same task given to us later

// no real value in this, just do wheel with owned T 

// TODO: pin this
pub trait Callback<Task, State, Out> {
    fn extract<'a>(&'a self, task: &'a mut Task) -> &'a mut State;
    fn call(self, task: Task, output: Out);
}

pub trait Future<Task, Out> {
    type State<C>;
    fn start<C: Callback<Task, Self::State<C>, Out>>(self, task: Task, callback: C);
}

trait BasicAsyncTask: Sized {
    type U32ToI32: Future<Self, i32>;
    fn async_u32toi32(u: u32) -> Self::U32ToI32;
}





struct InnerFuture {
    input: u32
}

impl<T: BasicAsyncTask> Future<T, i32> for InnerFuture {
    type State<C> = InnerSaveState<T, C>;

    fn start<C: Callback<T, InnerSaveState<T, C>, i32>>(self, mut task: T, callback: C) {
        println!("starting");
        let poopy = callback.extract(&mut task);
        // put stuff in poopy

        let cool = T::async_u32toi32(self.input);
        let mycallback = InnerCallback { cc: callback };
        
        cool.start(task, mycallback);
    }
}

struct InnerSaveState<T: BasicAsyncTask, C> {
    tt: <T::U32ToI32 as Future<T, i32>>::State<InnerCallback<C>>
}

struct InnerCallback<C> {
    cc: C
}

impl<T: BasicAsyncTask, C: Callback<T, InnerSaveState<T, C>, i32>> Callback<T, <T::U32ToI32 as Future<T, i32>>::State<InnerCallback<C>>, i32> for InnerCallback<C> {
    fn extract<'a>(&'a self, task: &'a mut T) -> &'a mut <T::U32ToI32 as Future<T, i32>>::State<InnerCallback<C>> {
        &mut self.cc.extract(task).tt
    }

    fn call(self, mut task: T, output: i32) {
        println!("second");
        let poopy = self.cc.extract(&mut task);
        // get stuff from poopy

        self.cc.call(task, output)
    }
}
use std::{marker::PhantomData, pin::Pin};


/*

if the fn1() calls fn2() calls fn3(), (i.e. fn3 is innermost call in stack)

Diagram:
task {
    minor bookkeeping
    pointer to overall context?? maybe this should be in state3 or as a threadlocal
    state1 {
        state2 {
            state3 {
                function pointer
                callback3 {
                    callback2 {
                        callback1 {
                            index/pointer to task/state1
                        }
                    }
                }
            }
        }
    }
}

all callbacks are ZSTs, they just have info on where to get task?
 - maybe task is from threadlocal (yucky)

implicit assumption that multiple calls to extract() will yield the same object

things that can go wrong:
 - extract returning a different object
 - extract returning an invalid object

*/

// TODO: pin this
pub struct Token {}

pub trait Callback<State, Out> {
    fn extract(&mut self) -> Pin<&mut State>;
    fn call(self, output: Out) -> Token;
}

pub trait Future<Out> {
    type State<C>: Default;
    fn start<C: Callback<Self::State<C>, Out>>(self, callback: C) -> Token;
}


struct U32ToI32 {}
struct U32ToI32State<C> { c: PhantomData<C> }
impl<C> Default for U32ToI32State<C> {
    fn default() -> Self {
        Self { c: Default::default() }
    }
}

fn async_u32toi32(u: u32) -> U32ToI32 {
    todo!()
}

impl Future<i32> for U32ToI32 {
    type State<C> = U32ToI32State<C>;

    fn start<C: Callback<Self::State<C>, i32>>(self, callback: C) -> Token {
        todo!()
    }
}




struct InnerFuture {
    input: u32
}

impl Future<i32> for InnerFuture {
    type State<C> = InnerSaveState<C>;

    fn start<C: Callback<InnerSaveState<C>, i32>>(self, mut callback: C) -> Token {
        println!("starting");
        let poopy = callback.extract();
        // put stuff in poopy

        let cool = async_u32toi32(self.input);
        cool.start(InnerCallback { cc: callback })
    }
}

struct InnerSaveState<C> {
    tt: <U32ToI32 as Future<i32>>::State<InnerCallback<C>>
}

impl<C> Default for InnerSaveState<C> {
    fn default() -> Self {
        Self { tt: Default::default() }
    }
}

struct InnerCallback<C> {
    cc: C
}

impl<C: Callback<InnerSaveState<C>, i32>> Callback<<U32ToI32 as Future<i32>>::State<InnerCallback<C>>, i32> for InnerCallback<C> {
    fn extract(&mut self) -> Pin<&mut <U32ToI32 as Future<i32>>::State<InnerCallback<C>>> {
        let poopy = self.cc.extract();
        unsafe { poopy.map_unchecked_mut(|p| &mut p.tt)}
    }

    fn call(mut self, output: i32) -> Token {
        println!("second");
        let poopy = self.cc.extract();
        // get stuff from poopy

        self.cc.call(output)
    }
}
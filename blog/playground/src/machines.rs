





use std::mem::ManuallyDrop;


trait SaveState {
    // TODO
    // save_state is like 
    /*
    struct C {
        fn_pointer
        outer_save_state
        inner_save_state
    }
    */
}

trait Callback<I> {
    type S: SaveState;
    fn call(self, input: I) -> Self::S;
}


// the type that implements future is just a container for inputs
// based on C, it makes it's own C type to store in its S type
trait Future<O> {
    type S<C: Callback<O>>: SaveState;
    fn start<C: Callback<O>>(self, callback: C) -> Self::S<C>;
}


fn start_execution(f: impl Future<()>) {

}



union YCont<I, C: Callback<I>> {
    c: ManuallyDrop<C>,
    m: ManuallyDrop<C::S>
}


// fn yelled<C: Callback<()>>(callback: C) -> YCont<(), C> {
//     YCont { c: ManuallyDrop::new(callback) }
// }

struct YelledFuture {}
struct YelledSave<C> {
    cheese: C
}
impl<C> SaveState for YelledSave<C> {
    // TODO
}


impl Future<()> for YelledFuture {
    type S<C: Callback<()>> = YelledSave<C>;

    fn start<C: Callback<()>>(self, callback: C) -> Self::S<C> {
        todo!()
    }
}



fn yelled() -> impl Future<()> {
    YelledFuture {}
}

/*
// trait continuation set by runtime?

fn thingy(intputs) -> impl Continuation {


    return do_thing(more_inputs, savestate)


}
 */

// implemented by runtime
// do_thing_state has to encapsulate all future states (as determined by callback)

/*

fn do_thing<C: Callback<()>>(inputs: u64, callback: C) -> do_thing_state<C> {

}
 */
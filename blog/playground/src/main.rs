mod runtime_trait;
mod wheel;
mod machines;
mod hybrid;


#[derive(Debug)]
struct Cheese {
    a: i32,
    b: i32
}

#[derive(Debug)]
struct BigBig {
    cheese1: Cheese,
    cheese2: Cheese,
    c: i32
}

fn transform_cheese(cheese: Cheese) -> Cheese {
    Cheese {
        a: cheese.a + 7,
        b: cheese.b + 9
    }
}



fn main() {
    let mut b = BigBig {
        cheese1: Cheese { a: 1, b: 2 },
        cheese2: Cheese { a: 3, b: 4 },
        c: 222
    };
    println!("{:?}", b);
    b.cheese2 = transform_cheese(b.cheese2);
    println!("{:?}", b);
    b.cheese1 = transform_cheese(b.cheese1);
    println!("{:?}", b);
}


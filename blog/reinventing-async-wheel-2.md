# Futures could be slightly more efficient

Everyone loves async. It's easy, intuitive, and has no hard parts. Many languages have built futures around the idea of a state machine; the different states represent different points in the execution of the function.

[insert Future trait]

very simple, very safe. Let's implement a simple future, like the following:

[double future]


Many languages implement futures this way, or close to it. example: C sharp, python



However, there is another way - continuation passing style (i.e. javascript, LLVM)




---
slug: why-learning-assembly-makes-you-a-better-hacker-coder-part-ii
title: Why Learning Assembly Makes You a Better Hacker & Coder (Part II)
date: 2025-10-08
description: Explore x86 instruction pointers, conditional jumps, memory
  addressing, and stack operations with practical assembly examples.
tags:
  - Assembly Language
  - x86
  - Computer Architecture
  - Programming
  - Cybersecurity
sourceUrl: https://medium.com/@bericontraster/why-learning-assembly-makes-you-a-better-hacker-coder-part-ii-1bf97fb1851e
cover: "/assets/media/blog/why-learning-assembly-makes-you-a-better-hacker-coder-part-ii/cover.webp"
coverAlt: "Assembly Language Part II cover artwork"
author: Beri Contraster
featured: true
draft: false
---

```link-card
url: /posts/why-learning-assembly-makes-you-a-better-hacker-coder/
title: "Part I: Why Learning Assembly Makes You a Better Hacker & Coder"
description: "Start with x86 registers, CPU architecture, the stack, and a Linux NASM Hello World program."
image: /assets/media/blog/assembly-language/cover.png
imageAlt: Assembly Language cover artwork
```

In Part I, we explored the basics of assembly — registers, the stack, and a simple code example. In this part, we’ll go a step further and dive into pointers, jumps, and memory access to see how they give us real control over program execution.

## Instruction Pointer

Let’s start with the instruction pointer. This is an internal pointer in the processor, often labeled as EIP. As our program runs, this pointer holds the location of our machine code that the processor is executing. This means the processor can jump around to different locations in the code by simply altering this pointer.
Unlike a register, we can’t change the instruction pointer by using `mov` `add` and `sub` operations. Instead, the instruction pointer is changed by `jmp` the operator.

Take a look at this little program:


```nasm
section .text
global _start
_start:
    mov ebx, 42     ; exit status is 42
    mov eax, 1      ; sys_exit system call
    jmp skip        ; jump to "skip" label
    mov ebx, 13     ; exit status is 13 (never reached)
skip:
    int 0x80
```

Here’s what happens step by step. At the start, we load `42` into `ebx` and `1` into `eax`. That sets us up for a system call to exit with a status code `42`. But before the processor actually hits the `int 0x80` instruction, there’s a `jmp skip`. This jump changes the instruction pointer (EIP), so instead of moving to the very next line (`mov ebx, 13`), the processor jumps straight down to the label `skip`. That means the line `mov ebx, 13` is completely skipped, even though it exists in the code.
And that’s the power of the instruction pointer: the CPU doesn’t just “go line by line.” It follows EIP, and whenever a jump occurs, EIP gets updated to a new memory address. That’s why our program exits with code `42` instead of `13`.

## Conditional Jumps

So far, we’ve seen how the instruction pointer can be moved around with an unconditional `jmp` it always jumps, no matter what. But real programs need logic: “if this is true, then do that.” That’s where conditional jumps come in. A conditional jump checks the result of a comparison or calculation and only changes the instruction pointer if the condition is met. If not, execution just continues normally.
Take a look at this little program:


```nasm
section .text
global _start
_start:
    mov ecx, 99        ; set ecx to 99
    mov ebx, 42        ; exit status is 42
    mov eax, 1         ; sys_exit system call
    cmp ecx, 100       ; compare ecx to 100
    jmp skip           ; jump to "skip" label (always jumps here in this example)
    mov ebx, 13        ; exit status is 13 (skipped)
skip:
    int 0x80
```

Here’s what’s happening step by step:
  1. We load `99` into `ecx`, and then set up for a system exit with status `42`.
  2. The instruction `cmp ecx, 100` compares the value in `ecx` with `100`. This sets internal CPU flags (like zero, greater, or less) that conditional jumps can use.
  3. Right now, we’re still using an unconditional jump (`jmp skip`), so the program always jumps to `skip` no matter what the comparison result is. That means the line `mov ebx, 13` is skipped every time.
  4. The program exits with status `42`.
If we replaced `jmp skip` with something like `je skip` (jump if equal), then the CPU would only jump to `skip` if `ecx == 100`. Since `ecx` is `99` here, that jump would not happen, and the program would continue to `mov ebx, 13`, exiting with status `13` instead.
This shows how the instruction pointer, combined with comparisons and conditional jumps, lets your code “decide” what path to take, just like `if` statements in high-level languages.

### Common Conditional Jump Instructions

When you use the `cmp` Instruction, the CPU sets internal flags based on the result (equal, greater, less, etc.). Conditional jumps then check those flags to decide whether to move the instruction pointer. Here are some of the most common ones:

  * `je` – Jump if Equal
  * `jne` – Jump if Not Equal
  * `jg` – Jump if Greater
  * `jge` – Jump if Greater or Equal
  * `jl` – Jump if Less
  * `jle` – Jump if Less or Equal

## Memory Access

Up to now, we’ve mostly worked with registers, moving values in and out of them. But real programs don’t live entirely in registers. Sooner or later, you’ll need to read from memory or write to memory. In assembly, memory is like a giant array of bytes, and registers often act as pointers to those locations.
Instead of just doing `mov eax, 5`, we can use brackets `[]` to tell the CPU: “go to this memory address and fetch/store the value.”


```nasm
section .data
    num dd 123       ; define a number in memory (double word)
section .text
global _start
_start:
    mov eax, [num]   ; load value at 'num' into eax (eax = 123)
    mov ebx, eax     ; copy that value into ebx
    mov [num], ebx   ; write value from ebx back into memory at 'num'
    mov eax, 1       ; sys_exit
    int 0x80
```

  1. The `.data` section defines variables in memory. Here, `num dd 123` reserves 4 bytes (a double word) and stores the value `123`.
  2. `mov eax, [num]` reads from memory: the CPU looks at the address labeled `num` and copies its value (`123`) into `eax`.
  3. `mov [num], ebx` writes back to memory: whatever is inside `ebx` is placed into the memory location at `num`.
  4. Notice how the brackets `[]` mean “go to memory at this address,” while without brackets, it just means the literal value or register itself.
This is the foundation for arrays, strings, and all kinds of data handling in assembly. Once you get comfortable with memory access, you’ll see how low-level code really interacts with data in RAM.

### Memory Access with the Stack
The stack is just another region of memory, but it has special instructions to make working with it easier. Think of it like a stack of plates: you can only put a new plate on top (`push`) or take the top plate off (`pop`). Under the hood, the CPU is still just reading and writing memory, but it uses the stack pointer register (ESP) to keep track of where the “top” is.


```nasm
section .text
global _start
_start:
    mov eax, 10       ; put 10 into eax
    push eax          ; push 10 onto the stack
    mov ebx, 20       ; put 20 into ebx
    push ebx          ; push 20 onto the stack
    pop ecx           ; pop top of stack into ecx (ecx = 20)
    pop edx           ; pop next value into edx (edx = 10)
    mov eax, 1        ; sys_exit
    int 0x80
```

  1. First, we load `10` into `eax` and push it onto the stack. Now the stack top holds `10`.
  2. Then we load `20` into `ebx` and push it. Now the stack top holds `20`, and just below it is `10`.
  3. When we `pop ecx`, the CPU pulls `20` off the stack and stores it into `ecx`.
  4. The next `pop edx` pulls the `10` into `edx`.

This shows the Last In, First Out (LIFO) nature of the stack: the last thing we pushed (`20`) is the first thing we popped.
Together, direct memory access (`mov eax, [num]`) and stack operations (`push`/`pop`) give you two of the most common ways assembly interacts with memory. These concepts are the backbone for function calls, local variables, and managing program flow.

### Conclusion

That’s it for Part II! We’ve seen how the instruction pointer works, how conditional jumps bring decision-making into assembly, and how memory access (including the stack) lets us handle data directly.

In Part III, we’ll take the next big step: exploring functions. We’ll see how arguments and return values are managed, how the stack is used to keep track of function calls, and why this knowledge is essential for both writing efficient code and understanding program exploits.

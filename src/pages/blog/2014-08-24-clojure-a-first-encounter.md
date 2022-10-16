---
title: Clojure - A first encounter
layout: "../../layouts/BlogPost.astro"
pubDate: 2014-08-24T16:32:17.000Z
modDate: 2018-04-02T10:50:49.000Z
---

I have been thinking for some time about picking up Clojure, a functional programming language and Lisp dialect that runs on top of the Java Virtual Machine. I have always wanted to learn a proper functional language, and Clojure with its Python and Ruby influences, compatibility with Java and the JVM, and web version (ClojureScript) seemed like a good bet.

My five year long education and short few months of work have so far been spent programming Java, Python and a bit of JavaScript and CoffeeScript. I shared a brief semester struggling with Prolog, a language inspired by first order logic, but never took the scenic route through the backroads of the varying Lisp dialects. It is about time I took the plunge into the vast sea of functional programming.

To that end I bought [Clojure Programming](http://shop.oreilly.com/product/0636920013754.do) and set to it. This blog post will not discuss the book, but it might be the topic of a future post.

*Removed image*

In what might become a blog series I will attempt to document my journey with Clojure. Without further ado let's get on with it.

## Getting Clojure up and running

Installing Clojure was relatively simple as Clojure is really just a JAR library that runs on the JVM. I ended up installing the newest version of the JVM (8), and installed [Leiningen](http://leiningen.org/), a build manager for Clojure with the [HomeBrew](http://brew.sh/) package manager for OS X. I immidiately stumbled into an error after running `lein repl`, the lein command for running an interactive Clojure repl. The JVM stack trace informed me of the following error:

    Error loading namespace; falling back to userNoSuchMethodError
    

Some googling turned up an [issue](https://github.com/technomancy/leiningen/issues/1625) submitted in the GitHub repo for the HomeBrew distribution of Leiningen. Of course the issue is already fixed in the Leiningen master branch, but the newest version is probably not pushed into the Homebrew package repositories yet. A workaround for the moment appeared to be running the command from inside a Leiningen Clojure-project. So that is was I tried:

    lein app helloclojure
    cd helloclojure
    lein repl
    

Running lein repl from inside a project changes the context in which the repl is run and alleviates the error, but I can't say what differences there might be.

## Light Table (editor)

While writing and testing Clojure in the OS X terminal in a REPL environment works well enough for learning the basics, it can quickly become cumbersome to write longer function as lack of linting and syntax highlighting makes it harder to read the code. So I set out to get myself an editor. Many programmers are big fans of [emacs](http://www.gnu.org/software/emacs/), an open source editor written in Lisp that is highly extensible. emacs provide almost endless possibilities, such as interpreting Lisp functions inside your code documents, and extending the editor functionality with Lisp code even as the editor is running. While emacs may be an amazing editor I find myself leaning towards editors that hold your hand; Editors that comfort you with a proper GUI interface, easy to use menus when you forget commands, and a good file map that provides an easy way to get an overview of your work.

[Light Table](http://www.lighttable.com/) is one of those editors. It is a quite recent addition to the editor world of old, and as such does not provide the same extensive feature set of older editors such as the aformentioned emacs, or newer additions such as [Sublime Text](http://www.sublimetext.com/). What it does provide is excellent Clojure and ClojureScript support, modern visuals, and great promise. It raised over 300.000$ on [Kickstarter](https://www.kickstarter.com/projects/ibdknox/light-table). Not bad for an open-source editor.

I found that it kickstarted me on my way to Clojure comprehension quite soon as its documentation suggested I try its feature instarepl. Instarepl appears to be a pseudo-repl environment that does not conform to the repl loop of read, evaluate, print, loop. Instead the editor provides a window in which you can enter and edit code at will; The code is interpreted on the fly. Next to each line of code Light Table shows you the data value or values being used. This amazing feature quickly tells you what the input to, and output of a given expression is.

*Removed image*

I will end the blog post before it becomes a Clojure book. Fare well, and keep on coding.

---
title: Shared mutable app state in Actix Web
layout: "../../layouts/BlogPost.astro"
pubDate: 2018-08-23T14:32:06.000Z
modDate: 2018-08-23T19:34:17.000Z
---

Not too long ago, and in this very galaxy, I decided to learn [the Rust programming language](https://www.rust-lang.org/en-US/). I went through each chapter in [the Rust Book](https://doc.rust-lang.org/book/) and discovered a lot of things I like about Rust. When the chapters ran out I set out to build something with Rust, a little pet project that would put my newly acquired Rust knowledge to the test. I decided to implement an authorization server using the [actix web framework](https://actix.rs/).

A central component of the Actix web framework is the `App` struct that is used to create an Actix application. The App struct has a generic type that is used as a placeholder for whatever struct you create to hold the application state to be used when handling requests. So far so good. I implemented my struct to hold my cache:

```rust
pub struct AppState {
    pub cache: Mutex<TimedCache<String, CodeItem>>,
}
```

As you can see the Appstate struct's cache property uses a Mutex type to hold the cache which would make it possible to do thread safe mutations on the cache via locking. Then I created the actix app:

```rust
pub fn new_app() -> App<AppState> {
    let state = AppState {
        cache: Mutex::new(TimedCache::with_lifespan(3600 * 3)),
    };

    App::with_state(state)
        .middleware(Logger:default())
        // More app-building here
}
```

My main.rs module then instantiated a server with an app like so:

```rust
fn main() {
    let mut server = server::new(|| app::new_app());
}
```

In each request handler were I needed access to the cache I would simply look up the cache property in the app state and create a lock:

```rust
let mut cache = match state.cache.lock() {
    Ok(cache) => cache,
    Err(error) => {
        return Ok(HttpResponse::from_error(error::ErrorInternalServerError(
            format!("Failed to get lock on cache: {}", error),
        )))
    }
};
```

And then add or get item:

```rust
let item = match cache.cache_get(&params.code) {
    Some(item) => item,
    None => {
        return Ok(HttpResponse::from_error(error::ErrorForbidden(
            "Code is no longer valid",
        )))
    }
};
```

In my `/auth` handler I would verify some authentication request, generate a code, cache the code, and finally return the response. In my `/token` handler I would try to read the value associated with the code from the cache, as the code above shows. My less than profound knowledge of Rust and the Actix framework left me surprised when it turned out that the cache was properly set in the /auth handler, but then suddenly empty in the /token endpoint. As it turns out the [Actix documentation](https://actix.rs/docs/application/) offered an answer and a clue to fix this.

> **Note**: http server accepts an application factory rather than an application instance. Http server constructs an application instance for each thread, thus application state must be constructed multiple times. If you want to share state between different threads, a shared object should be used, e.g. `Arc`.

Aha! The `server::new(|| app::new_app())` call will actually use the anonymous function (the application factory) to create an application for each thread it spawns. How does `Arc` solve this? So I read the [Arc documentation](https://doc.rust-lang.org/std/sync/struct.Arc.html) and could surmise that `Arc` is a thread safe reference count pointer and that invoking `clone` on such a pointer creates a new reference to the same value in the heap. Well, that sure sounds useful to share the cache between the threads using my application. Let's update the app struct:

```rust
pub struct AppState {
    pub cache: Arc<Mutex<TimedCache<String, CodeItem>>>,
}
```

Now the cache property would hold an Arc style pointer to a cache value, and the value would only be deallocated once all the references to it was gone. Finally it was necessary to move the initialization of the cache to someplace outside the application factory. So for the time being I placed it right before the code constructing the server:

```rust
// In the app module
pub fn new_app(cache: Arc<Mutex<TimedCache<String, CodeItem>>>) -> App<AppState> {
// App initialization code
}

// In the main module
fn main() {
    let cache = Arc::new(
        Mutex::new(
            TimedCache::with_lifespan(3600 * 3)
        )
    );
    let mut server = server::new(move || app::new_app(cache.clone()));
}
```

---

Seasoned Rust developers and people familiar with the Actix framework probably think most of this is quite obvious, but to me this took some thinking to figure out. I hope this might help others starting out. Rust is pretty cool and I would recommend it to anyone wanting to learn a more low level language.

---
title: A privacy respecting talk gravatar plugin
layout: "../../layouts/BlogPost.astro"
pubDate: 2018-04-25T15:01:44.000Z
modDate: 2018-04-25T19:32:05.000Z
---

[Some time ago](https://snorre.io/setting-up-coral-talk/) I started using the [Coral Talk](https://coralproject.net/products/talk.html) comment system for my blog. The system is probably way overkill for a blog my size, and I have so far only received one comment! While Coral Talk is pretty nice it lacks built in avatar support and I could only find a [plugin recipe](https://github.com/coralproject/talk-recipes/tree/master/plugins/avatar) requiring avatars to be hosted by third parties and the links to be updated by some external service.

In my quest for avatar support I decided I would like to implement an avatar plugin that would require minimal effort from users and the maintainer of a Coral Talk instance. [Gravatar](https://en.gravatar.com/) (i.e. globally recognized avatars) is a popular avatar service which provides avatar URLs for each user which can be embedded by any service. The concept is simple enough. Gravatar creates an avatar URL based on a user's md5 hashed email address and responds with the user uploaded avatar upon requests. Gravatar is used almost everywhere so why not in a Talk avatar plugin?

There are unfortunately a number of privacy issues to be aware of when considering using Gravatar. Fly.io, a cdn/adn provider, wrote a [summary of how gravatar hurts your visitors](https://fly.io/articles/how-gravatar-hurts-your-visitors/) which goes into these privacy issues and how some of them are solved using their Gravitas proxy server.

This inspired me to create a Talk Gravatar plugin that would solve some of these issues to help safeguard commenters' privacy. Enter [talk-plugin-gravatar](https://github.com/snorremd/talk-plugin-gravatar).

With talk-plugin-gravatar I've implemented a talk plugin that will safely proxy Gravatar requests via the Talk server using randomly generated avatar uuids to avoid leaking indentifible information to browsers. At the same time the Gravatar servers will only know the IP of the talk service from which the avatars are requested, not the specific pages the Gravatar users are commenting on. This is a big privacy win for commenters.

It should be pointed out that unlike the Fly.io Gravitas service which would proxy Gravatar requests for any number of source sites, the Gravatar plugin will only proxy requests for a single Talk instance and therefore not provide the same level of privacy. There is also the issue of styling. Unfortunately the default Talk markup and styling places the so called avatar slot on top of, rather than left of, the comment. You need to supply custom styling via Talk's administration settings to fix this issue.

## In conclusion

The plugin is pretty basic, but does its one function well. It relies on Talk's redis cache to cache avatar requests. This way the plugin avoids hammering the Gravatar service with requests, while offering about the same response timings as the Gravatar service would have if used directly. There are zero configuration options which makes it incredibly easy to set the plugin up.

You can see the plugin in action in my comment field.

---
title: isso - a lightweight privacy minded comment system
layout: "../../layouts/BlogPost.astro"
pubDate: "2016-05-03"
modDate: "2018-04-02"
---

I've been using [Ghost blog](https://ghost.org/developers/) for quite some time now and have been very happy with the functionality, performance, and the simplicity of the solution. I use the default theme Casper which I find to be a minimalistic and rather pleasing blog theme. I've also avoided analytics software (and ads, not that ads would amount to any money on my little blog) like the plague for two important reasons:

- Privacy: Adds and analytics software tend to cobble together visitors' browsing history to form a web of browsing history. I'm privacy conscious myself and would prefer to not expose my visitors to tracking networks if I can avoid it.

- Performance: Adding bloat and unnecessary Javascript to my page would only make the reading experience worse.

That is why if you visit this page [adblock plus](https://adblockplus.org/) reports zero blocked elements and [Ghostery](https://www.ghostery.com/) reports only [Gravatar](https://en.gravatar.com/) which is used by Ghost to find the avatar of each author. All in all not too shabby if you ask me.

There is however one thing in Ghost that was missing and that I'd really like to have which was a comment system. For some time I have had a few blog posts out, but no way for people to comment on them. This is no good. So I started looking into a few options.

One of the first systems that came to mind were [Disqus](https://disqus.com/). It is fairly popular and free to use. It lets you sign in with different SSO providers like Facebook and Google, and offers functionality for moderation etc. The issue for me though is the privacy concern. All comments live on the Disqus servers which is no good from a privacy perspective.

[Livefyre](http://web.livefyre.com/conversation-apps/) is also fairly popular out there, but it costs money and has the same privacy issue as Disqus so I quickly dismissed it.

A very attractive option then seemed to be [Discourse](https://www.discourse.org/) which I had read about before and experienced first hand on sites using it. Discourse seems like a really nice solution with some good ideas centred around live discussions through notifications and a flat thread view. The only issue for me was the difficulty in finding an easy to set up Docker image that would fit into my existing docker-compose setup.

So after some consideration and thought I remembered [isso](https://posativ.org/isso/) a project I had stumbled upon quite some time ago. And to my great fortune the project was alive and well and seemed to have gotten quite a few users since I last had checked it out. Not only was it alive and well, it checked a lot of the requirement boxes I held in my head for a blog comment system:

- It is light weight
- It's super simple to use
- Hosted on your own server
- Requires no SSO login
- Provides optional moderation feature
- Works very well with Docker and docker-compose with one of two unofficial docker images
- Integrates easily into Ghost blog through Handlebar theme modification

I won't go into how you set isso up in your own Ghost blog because [someone already did](https://blog.slowb.ro/integrating-privacy-aware-comment-system-to-a-blog-part-1/).

If you want to run isso with Docker check out:

- [bl4n/isso](https://hub.docker.com/r/bl4n/isso/) - Recommended in official isso documentation
- [wonderfall/isso](https://hub.docker.com/r/wonderfall/isso/) - Recommended by me for its smaller image size and use of Alpine linux!

You are also encouraged to read the [official isso documentation](https://posativ.org/isso/docs/).

## Update 19th March 2018

I have since moved to a new comment system, Coral Talk. Read more about that in [Coral Talk - An open source comment system from Mozilla](https://snorre.io/setting-up-coral-talk/).

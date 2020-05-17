---
path: "/blog/new-homepage-gatsbyjs-cloudflare-workers"
date_published: "2020-05-03"
title: "New homepage with Gatsby.js hosted with Cloudflare Workers"
---

The past couple of years or so I've been running a homepage at [snorre.io](https://snorre.io).
As many students of IT I wanted to host my website and blog on a virtual machine server under my control.
So I set out to find a good VM cloud provider and a simple open source blog CMS.
I eventually landed on [Ghost](https://ghost.org/) which at the time was a welcome alternative to WordPress and other CMS.
Ghost served me well over the years being mostly free of distractions and simple to maintain.
At some point the Ghost Foundation started complicating the content model and writing experience.

The past few years I've worked on projects using [React](https://reactjs.org/) in some form and grown to really like the UI library.
React allowed me to write nearly functional and declarative code to express UIs and was a big catalyst in getting me into Clojure (a modern lisp).
Additionally React allowed me to write UI as regular old JavaScript (with some light JSX syntax perhaps) with proper error messages and type checking.
At the same time I worked a bit with [Hugo](https://gohugo.io/) a static site generator (SSG) on a different project.
Working with Hugo showed me how nice it could be to work with SSG, to be able to produce static and fast web pages.

So at some point I decided to build myself new statically generated home page.
But was there any static site generators out there that satisfied my interests and requirements?
Hugo, Jekyll and others were too opinionated and used template engines focused around html.
Previous encounters with magic html templates in Angular had not done much to make me love html templates.

Fortunately I looked at [Gatsby](https://www.gatsbyjs.org/) a React based framework for building static sites.
Where many other SSG are focused on building simple static html pages via html templates, Gatsby offers full flexibility.
Gatsby is based around a GraphQL data fetching core and pages based on React to fetch the data and render pages.
You can easily build a highly interactive page with React featuring dynamic content.

It is still possible to use markdown files to write your blog via Gatsby's plugin system and the [remark plugin](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/).
This makes the writing experience equivalent to other SSG like Hugo and Jekyll for normal blog posts.
In the future I will experiment with mixed markdown and react component posts using the [mdx plugin](https://www.gatsbyjs.org/docs/mdx/).
This will allow me to embed more interactive content into the post experience.

Previously I have hosted my Ghost blog in a [Docker](https://www.docker.com/) container running on Ubuntu on a virtual machine.
The docker container was proxied by [Traefik](https://containo.us/traefik/) an ingenious proxy server with automatic Docker load balancing.
While I was very satisfied with this setup the complexity and time spent setting it up is undeniable.

So I wanted to find a simpler way of hosting my new home pages.
Having already used [Next.js](https://nextjs.org/) a few times I learnt about [Vercel's edge network offering](https://vercel.com/edge-network) to host sites.
Due to a short lived error with Vercel's GitHub signup integration I could not create an account there.
I am also a Cloudflare user and had looked a bit at [Cloudflare's Workers offering](https://workers.cloudflare.com/).
The major benefit of Vercel's offering is of course their free pricing tier for personal use.
I ended up subscribing to and setting up Cloudflare Workers before Vercel had fixed their signup bug, so for now I will stick with them.
To Vercel's benefit they responsed to my support request in a matter of two days confirming the issue and having already applied a fix.
At 5USD per month minimum the Cloudflare solution is not that costly however and has an edge server right here in my own country!

Some clever developers will probably point out that I could have used GitHub Pages for free.
And while I could certainly have done that I wanted a new learning experience and to use a product with a clear pricing model.
Paying for Cloudflare's Worker service assures me that I'm a customer and that hosting my page is indeed a priority for them.

At my old website I tried out two different comment systems, but never really got many comments.
To be compliant with GDPR (just in case) I had to set up a privacy policy to explain users how the data submitted to my comment system would be handled. 
So for my new pages I probably will not use a comment system.
Instead you can reach me at [contact@snorre.io](mailto:contact@snorre.io).
Don't hesitate to contact me if you have any questions about the setup.
I will leave you with this boilerplate Gatsby image from their example site setup:

![Some image](../images/gatsby-astronaut.png)



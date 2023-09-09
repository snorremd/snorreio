# Snorre.io

This is the source code for my personal website, [snorre.io](https://snorre.io).
It is built using [Astro](https://astro.build), a new static site generator built on top of [Vite](https://vitejs.dev/).
The source code is free and open source.
Feel free to poke around and use it as inspiration for your own website.

## 🚀 Quickstart

To get started, clone this repo, install dependencies and run dev server:

```bash
git clone git@github.com:snorremd/snorreio.git
cd snorre.io
npm install
npm run dev
```

## 🏗 Project structure

This project was bootstrapped from the [Astro blog template](https://github.com/withastro/astro/tree/main/examples/blog) with my own modifications and changes added.


It mostly still follows the same structure as the blog template:

```
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

### 📁 Pages
Essentially I have a few main pages:

- `index.astro` - The landing page with some info about my site
- `blog.astro` - The blog page with a list of all blog posts
- `blog/[slug].mdx` - A blog post template for each blog post
- `about.mdx` - Some backstory about me
- `privacy.mdx` - Privacy policy detailing what data I collect (not much)
- `projects.astro` - List of projects I have worked on

<!-- Paint board emoji -->
### 🎨 Styling

I use [Tailwind CSS](https://tailwindcss.com/) for styling, which is a utility-first CSS framework.

### 📦 Components

I have a few components that I use throughout the site.
The components folder also include my Solid.js comment system.

## 🚀 Deployment

I host my site on [Cloudflare Pages](https://pages.cloudflare.com/).
It has a generous free tier and is very easy to set up.
For my use case I just use the Cloudflare Git integration to automatically build and deploy my site on every push to the `main` branch.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run build:watch`  | Build your site and watch for changes            |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## License

The source code is licensed under the [MIT License](./LICENSE).
You are free to use it for your own website, but please provide attribution where you make direct use of my code.

The content, unless otherwise stated, is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).
Feel free to publish copies or derived work, but you must provide attribution and link back to my site and you must share any derivative work under the same license.
Commercial use of my content is not allowed.
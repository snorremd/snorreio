# Snorre.io

This is the source code for my personal website, [snorre.io](https://snorre.io).
It is built using [Astro](https://astro.build), a modern static site generator built on top of [Vite](https://vitejs.dev/).
The source code is free and open source.
Feel free to poke around and use it as inspiration for your own website.

## 🚀 Quickstart

To get started, clone this repo, install dependencies and run dev server:

```bash
git clone git@github.com:snorremd/snorreio.git
cd snorreio
bun install
bun run dev
```

## 🏗 Project structure

This project was bootstrapped from the [Astro blog template](https://github.com/withastro/astro/tree/main/examples/blog) with my own modifications and changes added.

It mostly still follows the same structure as the blog template:

```
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
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

### 🎨 Styling

I use [Tailwind CSS](https://tailwindcss.com/) for styling, which is a utility-first CSS framework.

### 📦 Components

I have a few components that I use throughout the site.
The components folder also includes my Solid.js comment system and likes functionality.

### API Endpoints

- `/api/likes` - Handles user likes for blog posts and other content


## 🧞 Commands

All commands are run from the root of the project, from a terminal:

### 📦 Basic Commands

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `bun install`          | Installs dependencies                            |
| `bun run dev`          | Starts local dev server at `localhost:3000`      |
| `bun run build`        | Build your production site to `./dist/`          |
| `bun run build:watch`  | Build your site and watch for changes            |
| `bun run preview`      | Preview your build locally, before deploying     |
| `bun run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `bun run astro --help` | Get help using the Astro CLI                     |

### 🔧 Development Scripts

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `bun run format`       | Format code with Biome                           |
| `bun run lint`         | Lint code with Oxlint                            |
| `bun run check`        | Type check with Astro                            |
| `bun run wrangler:dev` | Start Wrangler development server                |
| `bun run wrangler:preview` | Preview with Wrangler Pages                  |

### 🗄️ Database Scripts

| Command                    | Action                                           |
| :------------------------- | :----------------------------------------------- |
| `bun run db:migrate:local` | Apply migrations to local database               |
| `bun run db:migrate:prod`  | Apply migrations to production database          |
| `bun run db:codegen`       | Generate TypeScript types from database schema   |


## 🚀 Deployment

I host my site on [Cloudflare Pages](https://pages.cloudflare.com/).
It has a generous free tier and is very easy to set up.
For my use case I just use the Cloudflare Git integration to automatically build and deploy my site on every push to the `main` branch.


## 🗄️ Cloudflare D1 Database

This project uses [Cloudflare D1](https://developers.cloudflare.com/d1/) as a serverless SQLite database for storing user likes and other dynamic data. The database is configured in `wrangler.toml` and uses [Kysely](https://kysely.dev/) as the ORM.

### Database Setup

The project includes database migration scripts:

- `bun run db:migrate:local` - Apply migrations to local development database
- `bun run db:migrate:prod` - Apply migrations to production database
- `bun run db:migrate:preview` - Apply migrations to preview environment
- `bun run db:codegen` - Generate TypeScript types from database schema
- `bun run db:delete:local` - Delete local development database


## License

The source code is licensed under the [MIT License](./LICENSE).
You are free to use it for your own website, but please provide attribution where you make direct use of my code.

The content, unless otherwise stated, is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).
Feel free to publish copies or derived work, but you must provide attribution and link back to my site and you must share any derivative work under the same license.
Commercial use of my content is not allowed.
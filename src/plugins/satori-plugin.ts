import type {
  AstroConfig,
  AstroIntegration,
  RouteData,
} from "astro";
import satori from "satori";
import { html } from "satori-html";
import { readFile, writeFile } from "fs/promises";
import { parse } from "node-html-parser";



interface OgImageTemplateProps {
  site: string;
  title: string;
  description: string;
  author: string;
}

function OgImageTemplate({ site, title, description, author }: OgImageTemplateProps) {
  return html`
    <div class="bg-stone-900 text-stone-200 w-full h-full flex flex-col justify-start">
      <div class="flex flex-col justify-center items-center" style="font-family: shortstack;">
        <h2 class="text-2xl m-0 text-center pt-4 pb-4">
          Snorre.io
        </h2>
        <h1 class="text-6xl m-0 text-center px-16">
          ${title}
        </h1>
      </div>
      <img src="https://snorre.io/graphics/layered-waves-dark.svg" class="w-full h-32" />
      <div class="flex flex-col bg-stone-800 pb-16 px-16 grow justify-center" style="font-family: ubuntu;">
        <div class="flex flex-row max-w-full items-center -mt-8"> 
          <img src="https://ca.slack-edge.com/T9EJR0Z46-US8V5V5E3-b099507917a1-512" class="w-32 h-32 rounded-lg mr-8" />
          <p class="text-4xl font-ubuntu m-0">
            ${description}
          </p>
        </div>
      </div>
    </div>
    `;
}

interface GenerateOgImageProps {
  site: string;
  route: RouteData;
}

/**
 * Generate an og:image for a given route
 */
async function generateOgImage({ site, route }: GenerateOgImageProps) {
  // First we get the html for the route and parse out the title and description
  const html = await readFile(route.distURL!, { encoding: "utf-8" });
  const root = parse(html.toString());
  const title =
    root.querySelector("meta[name='title']")?.attributes["content"] ?? "";
  const description =
    root.querySelector("meta[name='description']")?.attributes["content"] ?? "";
  const author = "Snorre Magnus Davøen";

  // Then we generate the URL for the og:image
  const template = OgImageTemplate({ site, title, description, author });

  try {
    const svg = await satori(template, {
      width: 1200,
      height: 600,
      fonts: [
        {
          // Same font as used on the site headers
          name: "shortstack",
          data: await readFile("./public/fonts/shortstack-regular.woff"),
          style: "normal",
        },
        {
          // Ubuntu font for bread text in satori
          name: "ubuntu",
          data: await readFile("./public/fonts/ubuntu-regular.ttf"),
          style: "normal",
        }
      ],
    });

    // calculate write path by replacing index.html with index-og.svg
    const writePath = route.distURL!.pathname.replace(
      "index.html",
      "index-og.svg",
    );
    await writeFile(writePath, svg);
  } catch (e) {
    console.error("Could not generate og:image for route", route.route, e);
  }
}

/**
 * Satori plugin for Astro, returns Astro plugin
 */
export function satoriPlugin(): AstroIntegration {
  let astroConfig: AstroConfig;
  return {
    name: "satori-plugin",
    hooks: {
      "astro:config:done": ({ config }) => {
        console.log("Store config for satori-plugin");
        astroConfig = config;
      },
      "astro:build:done": async ({ routes }) => {
        console.log("Build done, generate og:image for each route");
        const ogImages = routes
          .filter((route) => route.distURL?.pathname?.endsWith("index.html")?? false)
          .map((route) =>
            generateOgImage({ route, site: astroConfig.site ?? "" }),
          );

        await Promise.all(ogImages);
      },
    },
  };
}

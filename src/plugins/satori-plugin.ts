import type {
  AstroConfig,
  AstroIntegration,
  RouteData,
} from "astro";
import satori from "satori";
import { html } from "satori-html";
import { readFile, writeFile } from "fs/promises";
import { parse } from "node-html-parser";
import { Resvg } from "@resvg/resvg-js"


interface OgImageTemplateProps {
  site: string;
  title: string;
  author: string;
  profilePic: string;
  wavesSvg: string;
}

function OgImageTemplate({ site, title, profilePic, wavesSvg }: OgImageTemplateProps) {
  return html`
    <div class="bg-stone-900 text-stone-200 w-full h-full flex flex-col justify-start">
      <div class="flex flex-col justify-center items-center" style="font-family: shortstack;">
        <h1 class="text-7xl m-0 text-center px-16 py-32">
          Snorre.io
        </h1>
      </div>
      <img src="data:image/svg+xml;base64,${wavesSvg}" class="w-full h-32 -mt-24" />
      <div class="flex flex-col bg-stone-800 pb-16 px-32 grow justify-center" style="font-family: ubuntu;">
        <div class="flex flex-row max-w-full items-center"> 
          <img src="data:image/jpeg;base64,${profilePic}" class="w-32 h-32 rounded-lg mr-8" />
          <p class="text-4xl font-ubuntu m-0">
            ${title}
          </p>
        </div>
      </div>
    </div>
    `;
}

interface GenerateOgImageProps {
  site: string;
  route: RouteData;
  profilePic: string;
  wavesSvg: string;
}

/**
 * Generate an og:image for a given route
 */
async function generateOgImage({ site, route, profilePic, wavesSvg }: GenerateOgImageProps) {
  // First we get the html for the route and parse out the title and description
  const html = await readFile(route.distURL!, { encoding: "utf-8" });
  const root = parse(html.toString());
  const title =
    root.querySelector("meta[name='title']")?.attributes["content"] ?? "";
  const description =
    root.querySelector("meta[name='description']")?.attributes["content"] ?? "";
  const author = "Snorre Magnus Davøen";

  // Then we generate the URL for the og:image
  const template = OgImageTemplate({ site, title, author, profilePic, wavesSvg });


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
      "index-og.png",
    );

    // Convert svg to png 
    const resvg = new Resvg(svg, {})
    const png = await resvg.render()
    const pngBuffer = await png.asPng()
    await writeFile(writePath, pngBuffer);
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

        const profilePic = (await readFile("./public/images/profile.jpeg")).toString("base64");
        const wavesSvg = (await readFile("./public/graphics/layered-waves-dark.svg")).toString("base64");
        

        const ogImages = routes
          .filter((route) => route.distURL?.pathname?.endsWith("index.html")?? false)
          .map((route) =>
            generateOgImage({ route, site: astroConfig.site ?? "", profilePic, wavesSvg }),
          );

        await Promise.all(ogImages);
      },
    },
  };
}

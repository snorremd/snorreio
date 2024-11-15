import { defineCollection, z } from "astro:content";
import { rssSchema } from "@astrojs/rss";

const mashAndFerment = z.object({
  steps: z.array(
    z.object({
      stepTemp: z.number(),
      type: z.string(),
      name: z.string(),
      stepTime: z.number().optional(),
    }),
  ),
});

const fermentable = z.object({
  name: z.string(),
  type: z.string(),
  origin: z.string(),
  supplier: z.string(),
  color: z.number(),
  grainCategory: z.string().optional().nullable(),
  amount: z.number(), // kg
});

const yeast = z.object({
  name: z.string(),
  type: z.string(),
  form: z.string(),
  attenuation: z.number(),
  minTemp: z.number(),
  maxTemp: z.number(),
  amount: z.number(),
  unit: z.string(),
});

const hop = z.object({
  name: z.string(),
  time: z.number(),
  ibu: z.number(),
  amount: z.number(), // grams
  usage: z.string(),
  alpha: z.number(), // % alpha acid
});

const style = z.object({
  category: z.string(),
  name: z.string(),
});

const equipment = z.object({
  name: z.string(),
  efficiency: z.number(), // Percentage
  batchSize: z.number(), // liters
});

const data = z.object({
  mashWaterAmount: z.number(),
  spargeWaterAmount: z.number(),
});

const beerRecipesCollection = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    _timestamp_ms: z.number(),
    abv: z.number(),
    ibu: z.number(),
    color: z.number(),
    fg: z.number(),
    og: z.number(),
    batchSize: z.number(), // liters
    style: style.optional().nullable(),
    mash: mashAndFerment,
    fermentables: z.array(fermentable),
    yeasts: z.array(yeast),
    hops: z.array(hop),
    equipment,
    data,
    boilTime: z.number(),
    boilSize: z.number(),
  }),
});

const musicCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tracklist: z.array(
      z.object({
        title: z.string(),
        duration: z.object({
          hours: z.number().optional(),
          minutes: z.number(),
          seconds: z.number(),
        }),
        soundcloud: z.string().optional().nullable(),
        downloads: z.array(
          z.object({
            url: z.string(),
            format: z.string(),
            sizeBytes: z.number(),
          }),
        ),
      }),
    ),
  }),
});

const blogCollection = defineCollection({
  type: "content",
  schema: rssSchema.extend({
    modDate: z.string().optional().nullable(),
    atprotoURI: z.string().optional().nullable(),
  }),
});

const projectCollection = defineCollection({
  type: "content",
  schema: rssSchema
    .extend({
      projectLink: z.string().optional().nullable(),
      from: z
        .union([z.string(), z.number(), z.date()])
        .transform((value) => (value === undefined ? value : new Date(value)))
        .refine((value) =>
          value === undefined ? value : !Number.isNaN(value.getTime()),
        ),
      to: z
        .union([z.string(), z.number(), z.date()])
        .transform((value) => (value === undefined ? value : new Date(value)))
        .refine((value) =>
          value === undefined ? value : !Number.isNaN(value.getTime()),
        )
        .optional(),
      pubDate: z
        .union([z.string(), z.number(), z.date()])
        .transform((value) => (value === undefined ? value : new Date(value)))
        .refine((value) =>
          value === undefined ? value : !Number.isNaN(value.getTime()),
        )
        .optional(),
    })
    .transform((entry) => ({
      ...entry,
      pubDate: entry.pubDate ? entry.pubDate : entry.from,
    })),
});

const talkCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    rssSchema.extend({
      eventName: z.string(),
      eventDate: z
        .union([z.string(), z.number(), z.date()])
        .transform((value) => (value === undefined ? value : new Date(value)))
        .refine((value) =>
          value === undefined ? value : !Number.isNaN(value.getTime()),
        ),
      eventLink: z.string().optional().nullable(),
      eventDescription: z.string().optional().nullable(),
      presentationLink: z.string().optional().nullable(),
      eventImage: image(),
      eventImageAlt: z.string().optional().nullable(),
    }),
});

export const collections = {
  blog: blogCollection,
  beers: beerRecipesCollection,
  music: musicCollection,
  projects: projectCollection,
  talks: talkCollection,
};

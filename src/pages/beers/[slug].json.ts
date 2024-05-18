import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export async function getStaticPaths() {
  const beers = await getCollection("beers");

  return beers.map((beer) => {
    return {
      params: {
        slug: beer.data.slug,
      },
      props: {
        beer: beer.data,
      },
    };
  });
}

export const GET: APIRoute = ({ params, props, request }) => {
  const beer = props.beer;
  return new Response(JSON.stringify(beer, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";

export async function GET(context: APIContext) {
	const blog = await getCollection("blog");
	return rss({
		// `<title>` field in output xml
		title: SITE_TITLE,
		// `<description>` field in output xml
		description: SITE_DESCRIPTION,
		// Pull in your project "site" from the endpoint context
		// https://docs.astro.build/en/reference/api-reference/#contextsite
		site: context.site ?? "",
		// Array of `<item>`s in output xml
		// See "Generating items" section for examples using content collections and glob imports
		items: blog.map((post) => post.data),
		// (optional) inject custom xml
		customData: "<language>en-us</language>",
	});
}

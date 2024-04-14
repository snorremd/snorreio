declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"music": {
"2024-04-13-contemplations-synth-neon-scapes.mdx": {
	id: "2024-04-13-contemplations-synth-neon-scapes.mdx";
  slug: "2024-04-13-contemplations-synth-neon-scapes";
  body: string;
  collection: "music";
  data: InferEntrySchema<"music">
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		"beers": {
"2021-11-07-saison": {
	id: "2021-11-07-saison";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2022-01-25-bitter": {
	id: "2022-01-25-bitter";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2022-01-25-christmas-stout": {
	id: "2022-01-25-christmas-stout";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2022-01-29-rykeloven---lov-om-vern-mot-tobakksskader--25": {
	id: "2022-01-29-rykeloven---lov-om-vern-mot-tobakksskader--25";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2022-06-11-lov-om-helligdager-og-helligdagsfred": {
	id: "2022-06-11-lov-om-helligdager-og-helligdagsfred";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2022-08-23-lov-om-gjennomfring-av-tilleggsavtale-mellom-norge-og-usa-om-forsvarssamarbeid": {
	id: "2022-08-23-lov-om-gjennomfring-av-tilleggsavtale-mellom-norge-og-usa-om-forsvarssamarbeid";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2023-06-11-edelmetalloven": {
	id: "2023-06-11-edelmetalloven";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2023-07-01-dubbel": {
	id: "2023-07-01-dubbel";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2023-12-17-christmas": {
	id: "2023-12-17-christmas";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
"2023-12-28-winter-warmer": {
	id: "2023-12-28-winter-warmer";
  collection: "beers";
  data: InferEntrySchema<"beers">
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../src/content/config.js");
}

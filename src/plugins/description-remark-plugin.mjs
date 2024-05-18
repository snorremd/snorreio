export function descriptionRemarkPlugin() {
	// All remark and rehype plugins return a separate function
	return (_, file) => {
		if (file.data.astro.frontmatter && file.data.meta) {
			file.data.astro.frontmatter.description = file.data.meta.description;
		}
	};
}

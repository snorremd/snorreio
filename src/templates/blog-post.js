import React from "react"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"


import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader';
deckDeckGoHighlightElement();

import tw from "twin.macro"
import { Global, css } from "@emotion/react"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"


export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { mdx } = data // data.markdownRemark holds your post data
  const { frontmatter, body } = mdx
  return (
    <Layout>
      <Global
        styles={css({})}
      />
      <SEO title={frontmatter.title || "Missing title"} />
      <div className="blog-post-container">
        <div className="blog-post">
          <h1>{frontmatter.title}</h1>
          <h2>{frontmatter.date_published}</h2>
          <MDXRenderer>{body}</MDXRenderer>
          <p>Any questions or comments. Feel free to send me an email at <a href={`mailto:contact@snorre.io?subject=${frontmatter.title}`}>contact@snorre.io</a>.</p>
        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 200)
      body
      fields {
        slug
      }
      frontmatter {
        title
        date_published(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
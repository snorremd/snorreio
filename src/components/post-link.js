import React from "react"
import { Link } from "gatsby"
import tw from "twin.macro"

const PostLink = ({ post }) => (
  <div tw="mb-8">
    <h1><Link to={post.frontmatter.path} tw="no-underline">
      {post.frontmatter.title} ({post.frontmatter.date_published})
    </Link></h1>
    <p>{post.excerpt}</p>
  </div>
)
export default PostLink
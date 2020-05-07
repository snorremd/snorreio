import React from "react"
import { Link } from "gatsby"
import tw from "twin.macro"

const PostLink = ({ post }) => (
  <div tw="my-4">
    <Link to={post.frontmatter.path}>
      {post.frontmatter.title} ({post.frontmatter.date_published})
    </Link>
    <p>{post.excerpt}</p>
  </div>
)
export default PostLink
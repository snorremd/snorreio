/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import tw from "twin.macro"
import { Global, css } from "@emotion/core"

import Header from "./header"
//import "./layout.css"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Global
        styles={css({
          all: "box-sizing: border-box",
          body: tw`bg-gray-900 text-gray-200 max-w-full`,
          h1: tw`text-green-300 my-4`,
          a: tw`text-green-300 underline`,
          p: tw`text-gray-300 my-6 text-justify`,
          blockQuote: tw`border-l-2 border-green-300 pl-4 my-2`,
        })}
      />
      <Header siteTitle={data.site.siteMetadata.title} />
      <div tw="flex flex-col items-center">
        <div tw="py-4 px-4" css={{ maxWidth: "960px" }}>
          <main>{children}</main>
          <footer tw="mt-4 py-4 border-t-2 border-gray-800 text-center">
            © {new Date().getFullYear()} Snorre Magnus Davøen. Built with
            {` `}
            <a href="https://www.gatsbyjs.org">Gatsby</a>. Hosted by
            {` `}
            <a href="https://workers.cloudflare.com/">Cloudflare</a>.
          </footer>
        </div>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout

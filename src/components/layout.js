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
import { Global, css } from "@emotion/react"

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
          all: tw`box-border font-sans text-left`,
          body: tw`bg-gray-900 text-gray-200 max-w-full`,
          h1: tw`text-green-300 mt-8 mb-6 text-lg md:text-xl lg:text-2xl`,
          h2: tw`text-green-300 mt-6 mb-4  md:text-lg lg:text-xl`,
          a: tw`text-green-300 underline`,
          p: tw`text-gray-300 mt-4 mb-2 leading-tight`,
          blockQuote: tw`border-l-2 border-green-300 pl-4 my-2`,
          ul: tw`mb-2 list-inside list-inside`,
          hr: tw`border-green-300 my-8 py-0`,
          img: tw`my-4`,
          code: tw`text-green-300 font-mono`,
          sup: tw`text-green-300`,
          table: tw`table-auto`,
          th: tw`px-4 py-2`,
          td: tw`border  border-green-900 px-4 py-2`
        })}
      />
      <Header siteTitle={data.site.siteMetadata.title} />
      <div tw="flex flex-col items-center">
        <div tw=" w-full py-4 px-4" css={{ maxWidth: "960px" }}>
          <main tw="w-full">{children}</main>
          <footer tw="mt-4 py-4 border-t-2 border-gray-800 text-center">
            © {new Date().getFullYear()} Snorre Magnus Davøen. Built with
            {` `}
            <a href="https://www.gatsbyjs.org">Gatsby</a>. Hosted by
            {` `}
            <a href="https://workers.cloudflare.com/">Cloudflare</a>. This page
            is opensource. Its source code is available on
            {" "}
            <a href="https://github.com/snorremd/snorreio">GitHub</a>.
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

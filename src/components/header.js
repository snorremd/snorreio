import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import tw from 'twin.macro'
import {css} from '@emotion/core'


const Header = ({ siteTitle }) => (
  <header tw="flex flex-row justify-center border-b-2 border-green-400 text-green-400 shadow">
    <div tw="py-4 px-4 flex flex-row justify-start" css={{maxWidth: "960px", width: "100%"}}>
      <h1 tw="my-0">
        <Link
          to="/"
          tw=""
        >
          {siteTitle}
        </Link>
      </h1>
    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header

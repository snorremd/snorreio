import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import tw from "twin.macro"
import css from "@emotion/react"

const Header = ({ siteTitle }) => (
  <header tw="flex flex-row justify-center border-b-2 border-green-400 text-green-400 shadow">
    <div
      tw="py-4 pl-4 pr-4 flex flex-row justify-between items-center"
      css={{ maxWidth: "960px", width: "100%" }}
    >
      <div>
      <h1 tw="text-lg m-0" arialabel="">
        <Link to="/" tw="">
          {siteTitle}
        </Link>
      </h1>
      </div>

    <div tw="">
      <Link to="/identities" tw="text-lg">
        Identities
      </Link>
    </div>
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

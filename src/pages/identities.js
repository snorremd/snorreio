import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../components/layout"

const IdentitiesPage = () => {
  const data = useStaticQuery(graphql`
    {
      allFile(filter: {relativeDirectory: {eq: "keys"}}) {
        edges {
          node {
            name
            relativeDirectory
            publicURL
          }
        }
      }
    }
  `)

  const keys = data.allFile.edges.map(edge => edge.node);

  return (
    <Layout>
      <h1>My identities</h1>

      <p>
        In this era of online identity it can be good to know who someone is around the Internet.
        This pages links to my public Internet identities including my gpg public key and some social profiles.
        Use this information for good, and do no evil. 
      </p>

      
      <h2>Keys</h2>

      <p>My public GPP key and other public keys I use to identify myself.</p>

      <ul>
      {keys.map(key => <li key={key.name}><a href={key.publicURL} download> {key.name}</a></li>)}
      </ul>
      
      <h2>Contact</h2>

      <p>Hit me up on <a href="mailto:contact@snorre.io">contact@snorre.io</a>.</p>

      
      <h2>Online communities</h2>

      <p>Where you can find me around the Internet.</p>

      <ul>
        <li><a href="https://github.com/snorremd">GitHub</a></li>
        <li><a href="https://twitter.com/snorremd">Twitter</a></li>
        <li><a href="https://news.ycombinator.com/user?id=snorremd">Hacker News</a></li>
      </ul>

    </Layout>
  )
}
export default IdentitiesPage
import React, { useState, useEffect } from "react"
import { withPrefix, useStaticQuery, graphql, StaticQuery } from "gatsby"

const ClientSideOnlyLazy = React.lazy(() => import("./clojure-editor"))

// Hook from https://usehooks.com/useScript/
let cachedScripts = []

function useScript(src) {
  // Keeping track of script loaded and error state
  const [state, setState] = useState({
    loaded: false,
    error: false,
  })

  useEffect(
    () => {
      // If cachedScripts array already includes src that means another instance ...
      // ... of this hook already loaded this script, so no need to load again.
      if (cachedScripts.includes(src)) {
        setState({
          loaded: true,
          error: false,
        })
      } else {
        cachedScripts.push(src)
        // Create script
        let script = document.createElement("script")
        script.src = src
        script.async = true
        // Script event listener callbacks for load and error
        const onScriptLoad = () => {
          setState({
            loaded: true,
            error: false,
          })
        }

        const onScriptError = () => {
          // Remove from cachedScripts we can try loading again
          const index = cachedScripts.indexOf(src)
          if (index >= 0) cachedScripts.splice(index, 1)
          script.remove()
          setState({
            loaded: true,
            error: true,
          })
        }

        script.addEventListener("load", onScriptLoad)
        script.addEventListener("error", onScriptError)

        // Add script to document body
        document.body.appendChild(script)

        // Remove event listeners on cleanup
        return () => {
          script.removeEventListener("load", onScriptLoad)
          script.removeEventListener("error", onScriptError)
        }
      }
    },
    [src] // Only re-run effect if script src changes
  )

  return [state.loaded, state.error]
}

const ClojureSnippetInner = ({ snippet, file }) => {

  const isSSR = typeof window === "undefined"
  const [loaded, error] = useScript(withPrefix(file.publicURL))

  return (
    <>
      {loaded && !error && !isSSR && (
        <React.Suspense fallback={<div />}>
          <ClientSideOnlyLazy snippet={snippet} />
        </React.Suspense>
      )}
    </>
  )
}

export default function ClojureSnippet(props) {
  return (
    <StaticQuery
      query={graphql`
        query {
          file(name: { eq: "sci" }) {
            publicURL
          }
        }
      `}
      render={data => <ClojureSnippetInner {...props} file={data.file} />}
    />
  )
}

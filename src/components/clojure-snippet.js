import React from "react"

const ClientSideOnlyLazy = React.lazy(() =>
  import("./clojure-editor")
)

const ClojureSnippet = ({snippet}) => {
  const isSSR = typeof window === "undefined"
  return (
    <>
      {!isSSR && (
        <React.Suspense fallback={<div />}>
          <ClientSideOnlyLazy snippet={snippet}/>
        </React.Suspense>
      )}
    </>
  )
}

export default ClojureSnippet
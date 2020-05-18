import React, { useState } from "react"

import tw from "twin.macro"
import { Global, css } from "@emotion/core"
import { Controlled as CodeMirror } from "react-codemirror2"
import { useDebounce } from "@react-hook/debounce"

// import { evaluate } from "../../out/sci_wrapper/sci"


import "codemirror/mode/clojure/clojure.js"
import "codemirror/lib/codemirror.css"
import "codemirror/theme/material.css"
import "./clojure-editor.css"

const ClojureEditor = ({ snippet }) => {

  const [code, updateCode] = useState(snippet)
  const [result, updateResult] = useDebounce(cljs.sci_wrapper.evaluate(snippet), 500)

  const output = `${result.result}\nLog:\n${result.out}`

  return (
    <div tw="mb-8 flex flex-col">
      <div tw="w-full h-32 mb-2">
        <CodeMirror
          style={{ height: "100%", width: "100%" }}
          value={code}
          options={{ theme: "material", mode: "clojure"}}
          onBeforeChange={(editor, data, value) => {
            updateCode(value)
            updateResult(cljs.sci_wrapper.evaluate(value))
          }}
          onChange={(editor, data, value) => {
            updateCode(value)
            updateResult(cljs.sci_wrapper.evaluate(value))
          }}
        />
      </div>
      <div tw="w-full h-32">
        <CodeMirror
          height={1}
          value={output}
          options={{ theme: "material", mode: "clojure", readOnly: true }}
        />
      </div>
    </div>
  )
}

export default ClojureEditor

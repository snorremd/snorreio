import React, { useState } from "react"
import tw from "twin.macro"
import { Global, css } from "@emotion/core"
import { Controlled as CodeMirror } from "react-codemirror2"
import { useDebounce } from "@react-hook/debounce"
import { evaluate } from "../../sci/sci"
import Loadable from "@loadable/component"

import "codemirror/mode/clojure/clojure.js"
import "codemirror/lib/codemirror.css"
import "codemirror/theme/material.css"
import "./clojure-editor.css"

const ClojureEditor = ({ snippet }) => {
  const [code, updateCode] = useState(snippet)
  const [result, updateResult] = useDebounce(evaluate(snippet), 500)

  return (
    <div tw="mb-8 flex flex-col">
      <div tw="h-32 flex flex-col w-full mb-2">
        <CodeMirror
          style={{ height: "100%", width: "100%" }}
          value={code}
          options={{ theme: "material", mode: "clojure"}}
          onBeforeChange={(editor, data, value) => {
            updateCode(value)
            updateResult(evaluate(value))
          }}
          onChange={(editor, data, value) => {
            updateCode(value)
            updateResult(evaluate(value))
          }}
        />
      </div>
      {"=>"}
      <div tw="h-32">
        <CodeMirror
          height={1}
          value={result}
          options={{ theme: "material", mode: "clojure", readOnly: true }}
        />
      </div>
    </div>
  )
}

export default ClojureEditor

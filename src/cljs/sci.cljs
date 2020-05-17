(ns sci
  (:require [sci.core :as sci]
            [clojure.pprint :as pprint]))

(def options
  {:bindings {}})

(defn run-cljs
  [code]
  (try
    (with-out-str
      (pprint/pprint
       (sci/eval-string code)))
    (catch js/Error e (.-message e))))

(defn ^:export evaluate
  [code]
  (run-cljs code))
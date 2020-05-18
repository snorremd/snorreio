(ns cljs.sci-wrapper
  (:require [sci.core :as sci]
            [clojure.pprint :as pprint]))

(def options
  {:bindings {}
   :realize-max 101})

(defn run-cljs
  [code]
  (try
    (with-out-str
      (pprint/pprint
       (sci/eval-string code options)))
    (catch js/Error e (.-message e))))

(defn ^:export evaluate
  [code]
  (run-cljs code))
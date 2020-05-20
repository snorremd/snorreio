(ns cljs.sci-wrapper
  (:require [sci.core :as sci]
            [clojure.pprint :as pprint]))

(def options
  {:bindings {}
   :realize-max 101})

(defn run-cljs
  [code]
  (let [sb (goog.string/StringBuffer.)
        result (sci/binding [sci/out sb]
                 (try
                   (with-out-str
                     (pprint/pprint
                      (sci/eval-string code options)))
                   (catch js/Error e (.-message e))))]
    #js {:result result
         :out (str sb)}))
    
  

(defn ^:export evaluate
  [code]
  (run-cljs code))
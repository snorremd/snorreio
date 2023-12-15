#!/usr/bin/env bb

(require '[babashka.curl :as curl])
(require '[babashka.process :refer [shell]])
(require '[clojure.string :as str])
(require '[clojure.java.io :as io])

(def recipe-folder "./src/beer-recipes")
(def client "tVjFFz7ZN2V5u4vBr31tqqBDxss1")

(defn op-available? []
  (try (-> (shell {:out :string} "op")
           :out
           ;; Check if string contains substring "1Password CLI"
           (str/includes? "1Password CLI")
           )
       (catch Exception _ (throw (ex-info "op not available" {})))))

(defn op-secret! []
  (-> (shell {:out :string} "op read op://Personal/Brewfather-Token/credential")
      :out
      str/trim
      (try (catch Exception _ (throw (ex-info "could not fetch api secret from one password" {}))))))

(def op-secret-memoized! (memoize op-secret!))

(defn last-recipe!
  "Get the last recipe we downloaded from the download folder"
  []
  (-> (shell {:out :string} (str "ls -t " recipe-folder " | head -n 1"))
      :out
      (try (catch Exception _ (throw (ex-info "could not find last recipe" {}))))))


(defn list-remote-recipes!
  "Fetch recipes, e.g. curl -H \"authorization: Basic eHl6MTIzOjEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTBhYmNk\" "
  [basic-auth start-after]
  (-> (curl/get "https://api.brewfather.app/v2/recipes"
                {:headers {"authorization" basic-auth
                           "Content-Type" "application/json"}
                 :as :json})
      :body))

(defn basic-auth
  [client secret]
  (let [encoder (java.util.Base64/getEncoder)
        client-secret (str/join ":" [client secret])]
    (str "Basic " (.encodeToString encoder (.getBytes client-secret)))))
  

(defn main [& args]
  (op-available?)
  (as-> (last-recipe!) $
    (list-remote-recipes! $))
  )
  
  
  

#_(try (main)
     (catch Exception e
       (println "Error:" (.getMessage e))
       (System/exit 1)))



(comment
  (main)

  (op-secret!)
  (str/includes? "1Passsword CLI" "1Passsword CLI")
  (list-remote-recipes! (basic-auth client (op-secret!))
                        nil)
  )
#!/usr/bin/env bb

(require '[babashka.curl :as curl])
(require '[babashka.process :refer [shell pipeline process]])
(require '[clojure.string :as str])
(require '[cheshire.core :as json])
(import 'java.time.format.DateTimeFormatter
        'java.time.LocalDateTime
        'java.time.Instant
        'java.time.ZoneOffset)

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
  (-> (process (str "ls -t " recipe-folder))
      (process {:out :string} "head -n 1" )
      deref
      :out
      str/trim
      (as-> $ (str recipe-folder "/" $))
      slurp
      (json/parse-string true)
      :_id
      (try (catch Exception _ (throw (ex-info "could not find last recipe" {}))))))

(defn basic-auth
  [client secret]
  (let [encoder (java.util.Base64/getEncoder)
        client-secret (str/join ":" [client secret])]
    (str "Basic " (.encodeToString encoder (.getBytes client-secret)))))
  

(defn list-remote-recipes!
  "Fetch recipes from Brewfather API using basic auth and optional start-after timestamp"
  [basic-auth start-after]
  (println "Fetching recipes from Brewfather API after " start-after)
  (-> (curl/get "https://api.brewfather.app/v2/recipes"
                {:headers {"authorization" basic-auth
                           "Content-Type" "application/json"}
                 :query-params (when start-after {:start_after start-after})})
      :body
      (json/parse-string true)))

(defn fetch-remote-recipe!
  "Fetch single recipe from Brewfather API using recipe id"
  [basic-auth id] 
  (-> (curl/get (str "https://api.brewfather.app/v2/recipes/" id)
                {:headers {"authorization" basic-auth
                           "Content-Type" "application/json"}})
      :body
      (json/parse-string true)))

(defn timestamp->date-str
  "Convert timestamp to date string on pattern yyyy-MM-dd"
  [timestamp]
  (-> (Instant/ofEpochMilli timestamp)
      (LocalDateTime/ofInstant (ZoneOffset/UTC))
      (.format DateTimeFormatter/ISO_LOCAL_DATE)))

(defn string-to-slug [s]
  (-> s
      clojure.string/lower-case
      (clojure.string/replace #" " "-")
      (clojure.string/replace #"[^\w\s-]" "")))

(defn write-recipe!
  [recipe]
  (spit (str recipe-folder
             "/"
             (-> recipe :_timestamp_ms timestamp->date-str)
             "-"
             (string-to-slug (-> recipe :name))
             ".json")
        (json/generate-string recipe {:pretty true})))

(defn main [& args]
    (op-available?)
    (as-> (op-secret!) $
      (basic-auth client $)
      (list-remote-recipes! $ (last-recipe!))
      (map :_id $)
      (doseq [id $]
        (println "Fetcing recipe" id)
        (-> (fetch-remote-recipe! (basic-auth client (op-secret!)) id)
            (write-recipe!)))))
  
  
  

(try (main)
     (catch Exception e
       (println "Error:" (.getMessage e))
       (System/exit 1)))



(comment
  (main)
  (last-recipe!)

  (op-secret!)
  (str/includes? "1Passsword CLI" "1Passsword CLI")
  (list-remote-recipes! (basic-auth client (op-secret!))
                        nil)
  (as-> (op-secret!) $
    (basic-auth client $)
    (list-remote-recipes! $ (last-recipe!))
    (map :_id $)
    (doseq [id $]
      (println "Fetcing recipe" id)
      (-> (fetch-remote-recipe! (basic-auth client (op-secret!)) id)
          (write-recipe!))))
    
  )
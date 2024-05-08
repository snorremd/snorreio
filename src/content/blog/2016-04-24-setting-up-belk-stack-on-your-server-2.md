---
title: Setting up (B)ELK stack on your server
pubDate: "2016-04-24"
modDate: "2018-04-02"
---

I'm a developer by day, but as evening falls I sometimes like to dabble as an amateur sysops. I've recently helped out setting up a server as part of a hobby project that I participate in. While I'm no sysops expert I like testing out technologies helpful in server administration. As a side effect it makes me appreciate just how much detail and work sysops people put into managing servers. One of these sysops technologies is the much known ELK stack (ElasticSearch, Logstash, and Kibana) recently joined by the different Beat log ingestion system services. ELK are usually used as a general tool to gather, filter, index, and analyze logs from different sources. In this post I will describe how a BELK stack can be set up, partially in docker and partially on the host, to provide an insight into your systems network traffic, system activity (from system logs), and process and performance activity.

## ElasticSearch

The first piece of the puzzle is [ElasticSearch](https://www.elastic.co/products/elasticsearch) a distributed search and analysis technology based on the Lucene library. It can be used to index documents and then search in them. It will index our log and event entries in our BELK stack. We can use the [ElasticSearch docker image](https://hub.docker.com/_/elasticsearch/). If you are not familiar with [Docker](https://www.docker.com/) you might want to read up on both Docker and Docker Compose.

Create an `elk` and `elasticsearch` folder somewhere appropriate. When using docker `/srv` is commonly used.

    mkdir -p /srv/elk/elasticsearch

Now create a new `docker-compose.yml` file either in the `/srv/elk` folder, or better yet on your own computer. It all depends on whether you have tcp access to the docker-engine on the host where you are setting up the BELK stack. Add the following contents to it:

    elasticsearch:
      image: elasticsearch:latest
      restart: always
      volumes:
        - /srv/elk/elasticsearch/plugins:/usr/share/elasticsearch/plugins
        - /srv/elk/elasticsearch/data:/usr/share/elasticsearch/data
      ports:
        - "127.0.0.1:9200:9200"
        - "127.0.0.1:9300:9300"

We call the service `elasticsearch`, use the latest elasticsearch image, and map in ports and volumes from the host into the container. The elasticsearch api should now be available from the host server's port `9200` on `localhost` only.

You may start the elasticsearch container to check that everything works by running `docker-compose up -d`. Run `docker-compose stop` to stop elasticsearch.

## Kibana

[Kibana](https://www.elastic.co/products/kibana) is our second piece of the puzzle. It is simply put a web based data exploration and visualization tool built on top of elasticsearch to make it simple to explore and visualise/graph your elasticsearch data. It is commonly used to visualise logs or just data.

For Kibana we'll use the official [Kibana image](https://hub.docker.com/_/kibana/) to run Kibana in a docker container. We can simply add Kibana as a service in our `docker-compose.yml` file (the same one as before) by appending the following yaml config:

    kibana:
      image: kibana:latest
      restart: always
      volumes:
        - /srv/elk/kibana/config:/opt/kibana/config
      ports:
        - "127.0.0.1:5601:5601"
      links:
        - elasticsearch

and create a `kibana` folder under our elk folder:

    mkdir -p /srv/elk/kibana/config

Kibana relies on a config file `kibana.yml` to function so you will need to add this under the kibana config folder.

    touch /srv/elk/kibana/config/kibana.yml

See [Setting Kibana server properties](https://www.elastic.co/guide/en/kibana/current/kibana-server-properties.html) in the Kibana docs for which properties you may configure. For this setup you probably don't need to change anything and can rely on the default values.

If you want to test that your Kibana instance works you can again start the docker containers as instructed before with `docker-compose up -d`. You Kibana instance should be accessible from [localhost:5601](http://localhost:5601) on your server. Run `docker-compose stop` to stop the services again.

## Logstash

While it is entirely possible to make TopBeat, PacketBeat, and FileBeat send their log and event data straight to ElasticSearch you might want to pass them through Logstash as this affords you Logstash's filter feature with which you may extract more detailed information from your logs. We will therefore set up Logstash as well, all though this post won't touch upon using the filter feature.

An official [Logstash Docker image](https://hub.docker.com/_/logstash/) is available so again we use Docker to run the service. Create a folder for logstash configs:

    mkdir -p /srv/elk/logstash/config

and add the following Logstash service configuration to the existing `docker-compose.yml` file:

    logstash:
      image: logstash:latest
      restart: always
      command: logstash -f /etc/logstash/conf.d/logstash.conf
      volumes:
        - /srv/elk/logstash/config:/etc/logstash/conf.d
      ports:
        - "127.0.0.1:5000:5000"
      links:
        - elasticsearch

As you can see we link in the elasticsearch service (so logstash can gain access to it from `elasticsearch:9200`, and map in a configuration directory from our host to the logstash container. We've also exposed the Logstash container's port `5000` on the server's `localhost:5000`.

You need to provide logstash with a configuration file in order to make it listen to port 5000 and send documents to elasticsearch:

    vim /srv/elk/logstash/config/logstash.conf

which should contain an input section for the Beats and an ouput section for the ElasticSearch server:

    input {
      beats {
        port => 5000
      }
    }

    output {
      elasticsearch {
        hosts => "elasticsearch:9200"
        manage_template => false
        index => "%{[@metadata][beat]}-%{+YYYY.MM.dd}"
        document_type => "%{[@metadata][type]}"
      }
    }

The Beats will now be able to send their data to Logstash at `localhost:5000` from the host. We are now done with the Docker based services so you may start them with: `docker-compose up -d` from the directory where you keep your `docker-compose.yml` file. We need Logstash and Elasticsearch to be running for the upcoming steps.

## Beats

Finally we need a way to collect our log data. While Logstash can read log files from our host the FileBeat package is special made to perform this task. Unlike Elasticsearch, Logstash, and Kibana we will install FileBeat, TopBeat, and PacketBeat on our host.

First add the Beat repository as [described here](https://www.elastic.co/guide/en/beats/libbeat/1.2/setup-repositories.html) (for the distro of your choice). Then install the beats. On Ubuntu you can use apt:

    apt install filebeat packetbeat topbeat

Now we need to configure each Beat to use our Logstash instance, and provide our Elasticsearch server with the relevant Beat templates.

First edit the filebeat config with `vim /etc/filebeat/filebeat.yml` and make sure that the `elasticsearch` ouput is commented out:

    # elasticsearch:
        # hosts: ["localhost:9200"]

Then comment in the logstash ouput config:

    ### Logstash as output
      logstash:
        # The Logstash hosts
        hosts: ["localhost:5000"]

Remember that we configured our Logstash server to listen to port 5000, and mapped port 5000 out to `localhost:5000` on our host. This enables Filebeat to log its event to that port.

Then we need to insert the Filebeat template into our Elasticsearch index. The documentation tells us that we can use Curl for this:

    curl -XPUT 'http://localhost:9200/_template/filebeat' -d@/etc/filebeat/filebeat.template.json

Finally we can start Filebeat. On Ubuntu you may use `service filebeat start`.

You can now repeat these steps for PacketBeat and TopBeat. Note that you may want to set the interval of data collection in the Topbeat configuration to avoid generating too much data. What interval is right for you might depend on your disk space, but 5 minutes works for me.

## Add Beat indexes to Kibana.

If everything worked out okay you should now be able to go to Kibana and add your indices. Go to [localhost:5601](http://localhost:5601) and click the `Settings` tab. You should be presented with a screen where you can configure an index pattern. Thanks to our Logstash configuration an new index will be created each day for each of our Beat loggers. Our pattern should thus match the configuration `"%{[@metadata][beat]}-%{+YYYY.MM.dd}"` (from the Logstash config). So to get each of the three index types into Kibana we simply add them as `filebeat-*`, etc. If your index pattern is matched Kibana should show a green `Create` button as in the screenshot below.

_Removed_

After adding the index pattern you should be able to go to the `Discover` tab and view and search your logs.

_Removed_

You can now create your own visualizations over the indexed logs or you can download some of the visualizations and dashboards already created by the Kibana team. You can read more about that [here](https://www.elastic.co/guide/en/kibana/current/dashboard.html) and [here](https://www.elastic.co/guide/en/beats/libbeat/current/load-kibana-dashboards.html).

Hope this guide helped you get started. Currently I've not yet tried setting up custom filters for things such as fail2ban and ufw in order to better visualize malicious traffic. You can also use a geoip plugin to map log and network traffic events on a world map to see where traffic is coming from. A future blog post might cover these subjects.

## Attributions

Image post header:

By Bureau of Land Management (Dean Creek Elk 4 Uploaded by Albert Herring) [CC BY-SA 2.0 ([http://creativecommons.org/licenses/by-sa/2.0](http://creativecommons.org/licenses/by-sa/2.0))], via Wikimedia Commons.

---
title: Coral Talk - An open source comment system from Mozilla
date_published: 2018-01-27T22:41:21.000Z
date_updated: 2018-04-02T10:50:49.000Z
---

[Coral Talk](https://coralproject.net/products/talk.html) is a comment and moderation system from Mozilla. It is part of the Coral project which proclaims that it wants to improve journalism. I'm no journalist, but I found their comment system interesting for four particular reasons:

1. It is open source and backed by mozilla
2. It is self hosted which means

- I own my own data
- Users won't have their comments become ad targeting food

3. It has a simple admin and moderation dashboard
4. It is based on a plugin architecture which allows anyone including me to easily extend its functionality

I had [previously](https://snorre.io/isso-a-lightweight-privacy-minded-comment-system/) set up [isso](https://posativ.org/isso/) on my blog, but the lack of a moderation system not relying on smtp meant I would have to trust Internet users not to post obscene content or spam in my comment section. That said, isso is an excellent little comment server. If you have an smtp server set up the built in moderation feature might work for you.

Talk checks some of the same checkboxes isso does. It is open source, self hosted, etc. It does however come at a greater resource cost using both mongodb and redis to store and cache content where isso just uses sqlite. It does not allow anonymous comments either, which is something that might stop people from commenting all together. I did receive some comments in my old isso installation. It will be interesting to see if anyone bothers creating a user to comment on any of my posts.

## Running Coral Talk with Docker

As you might have surmised I'm a fan of [Docker](https://www.docker.com/). Docker allows you to quite easily run software without worrying about dependencies and process managers. The Talk project provides an [Installation from Docker](https://coralproject.github.io/talk/installation-from-docker/) guide which will get you started. Essentially you can host it using a docker-compose setup where talk, mongodb, and redis is configured. My current setup looks like this:

    version: "3"
    
    services:
      talk:
        build: ./talk
        restart: unless-stopped
        ports:
          - 80:3000
        depends_on:
          - mongo
          - redis
        networks:
          - talk
        environment:
          - TALK_MONGO_URL=mongodb://mongo/talk
          - TALK_REDIS_URL=redis://redis
          - TALK_ROOT_URL=https://talk.<yourdomain>.tld
          - TALK_PORT=3000
          - TALK_JWT_SECRET=<your-super-secret-jwt-secret>
        logging:
          driver: "json-file"
          options:
            max-size: "512k"
            max-file: "10"  
    
      mongo:
        image: mongo:latest
        restart: unless-stopped
        volumes:
          - mongo:/data/db
        networks:
          - talk
        logging:
          driver: "json-file"
          options:
            max-size: "512k"
            max-file: "10"
    
      redis:
        image: redis:latest
        restart: unless-stopped
        volumes:
          - redis:/data
        networks:
          - talk
        logging:
          driver: "json-file"
          options:
            max-size: "512k"
            max-file: "10"
    
    
    volumes:
      mongo:
      redis:
    
    networks:
      talk:
    

Note the `build: ./talk` section under the `talk` service. Because I'm not a big fan of Facebook login and setting up a Facebook app and api key just to use a comment system I decided to modify the default Talk docker image and not load the Facebook authentication plugin. My `Dockerfile` to accomplish this is included below. The command simply removes the config line containing the facebook auth plugin.

    FROM coralproject/talk:4-onbuild
    
    RUN sed -i '/talk-plugin-facebook-auth/d' ./plugins.default.json
    

This allows me to build an image where the Facebook authentication plugin is not activated and thus I do not have to setup a Facebook application just to use the Talk comment system. Setting up Talk using Docker proved to be quite easy.

In conclusion I think Talk will serve me quite nicely. There are still features I have yet to try like the [toxic-comments](https://blog.coralproject.net/toxic-avenging/) plugin, authoring my own plugins, and of course creating a custom style. But everything in due time.

---
title: Setting up a  Docker image builder with Gitlab CI Runner
date_published: 2016-04-21T19:05:40.000Z
date_updated: 2018-04-02T10:50:49.000Z
---

In this post I'll give you an idea on how to implement a Docker image builder with the Gitlab Runner. Before I do that I'll briefly introduce Gitlab and Gitlab CI.

Update! See my new post detaling som [strategies for building Docker images with Gitlab CI](https://snorre.io/building-docker-images-with-gitlab-ci/).

[Gitlab](https://about.gitlab.com/), if you do not already know, is an open-source git hosting and management solution also offered as an enterprise version (on premise or hosted). In my opinion it is fast becoming one of the best solutions for git hosting and is a welcome competitor to Github.

For quite some time now Gitlab has offered [Gitlab CI](https://about.gitlab.com/gitlab-ci/) a continuous integration server, initially stand alone, but later integrated into Gitlab itself. Among the most important features in Gitlab CI we find the concept of dedicated runners (equivalent to slaves for those familiar with Jenkins). The CI server itself only orchestrates the CI build jobs, while the runners do the heavy lifting. As long as the runners run on one or more separate servers the orchestrator-runner pattern results in a safe environment where the build scripts have very little access to the CI server and of course git server itself.

Gitlab CI uses `gitlab-ci.yml` files defining one or more build jobs to run continuous integration jobs. These are similar to `travis.yml` and other yaml based CI build script files. It might for example look something akin to this (some bits missing):

    types:
      - build
      - test
      - deploy
    
    build_app:
      type: build
      script: ./make build
    
    test_app:
      type: test
      script: ./make test
    
    deploy_app:
      type: deploy
      script: scp ./app deployuser@someserver:/app
    

In the example we define three build stage types: `build`, `test`, and `deploy`. The order is significant. We also define three jobs, `build_app`, `test_app`, and `deploy_app`, which are executed in the order given by the types to which they belong. If one build stage fail, the others will not be executed. All of this is probably familiar to you if you've used other CI services before.

## Gitlab Runner executors

With hosted CI solutions you often don't have a lot of, or need for, choice with regards to how the builds are executed. At [Travis CI](https://travis-ci.org/), a good hosted solution, you either build in a virtual machine or docker container.

[Gitlab Runner](https://gitlab.com/gitlab-org/gitlab-ci-multi-runner) on the other hand affords you a host of executors:

- `shell` - executes build script on host
- `docker` - executes build inside docker container(s)
- `virtualbox` - executes build in a virtualbox vm
- `parallels` - executes build in a parallels vm
- `ssh` - runs build on a different host via ssh
- `docker-machine` - autoscales docker machine instances and runs builds in containers across these instances

While you might find it tempting to run builds directly on the host with the shell executor it is seldom a good idea to allow script execution directly on your host, especially if this runner is to be shared with several people. The ssh runner will also be problematic in that aspect.

The Virtualbox and Parallels based runners isolate builds as a new VM is cloned and started for each new build. One problem with the vm based executors are their lack of support for some of the caching features of Gitlab Runner. They are also slow to start up for big VMs as the whole virtual machine image has to be copied.

That leaves us with the final two options the docker and docker-machine runners. The docker executor will spawn a container for each build (and even each build stage) and run the build scripts inside the container thereby isolating the build environment from the Gitlab Runner host environment. One of the great benefits of the docker runner is the lightweight nature of spawning docker containers. Once a docker image, say node, is present on the Gitlab Runner host, it takes mere seconds to start it!

Unless you have extremely large and fluctuating build pressure you probably don't need the docker-machine executor with auto-scaling.

So you install the [Gitlab Runner package](https://github.com/ayufan/gitlab-ci-multi-runner/blob/master/docs/install/linux-repository.md) and [Docker](https://docs.docker.com/engine/installation/) on your Ubuntu/Debian/SomeDistro server. Everything is set for your docker enabled build adventure.

So say we want to build a Node.js-application, we can supply a `.gitlab-ci.yml` file similar to the one below (greatly simplified). Note the `image` property for the build stage. It specifies which docker image to use for the build. Here we use the [Node 5 image](https://hub.docker.com/_/node/).

    types:
      - allthethings
    
    build_app:
      type: allthethings
      image: node:5
      script:
        - npm run test
        - npm run build
        - npm run deploy
    

Great! We've managed to get our app tested, built, and deployed from within the Node.js docker container. Though this is not actually the problem we set out to solve. Indeed what we want is for the Gitab Runner to build us a Docker image with our app inside and then deploy that docker image to a registry of our choice.

There's not a ton of documentation on the subject out there, hence this blog post, but Gitlab has a page on [Using Docker Build](http://doc.gitlab.com/ee/ci/docker/using_docker_build.html) in their docs. What you will quickly discover, as I once did, is that both their suggested options come with some security warnings. You can either add the `gitlab-runner` user to the docker group and use the `shell` executor. This will however essentially give the `gitlab-runner` user root access to your host server. The `docker-in-docker` solution is not much better as the docker container must run in privileged mode thereby providing a chance for the build script to perform privilege escalation and all other shenanigans.

So what can we do to get around this you may ask? Use an external docker engine on a more isolated host! There is nothing dictating that the build process be given direct unix socket access to a docker engine. Instead I suggest exposing a docker-engine from another host via tcp. This way your build script can use the remote docker engine without compromising your build server. Granted you set up server client certificate authentication on the remote docker engine only your build scripts will have access. So how might this look you ask?

Well start a docker engine for example via [docker-machine](https://docs.docker.com/machine/). `docker-machine create -d virtualbox dockerbuilder`. This will create a vm based on `boot2docker`, configure ssh, and set up docker server and client certificates. For simplicity's sake you can start it on your Gitlab Runner-server, though the location should not matter much.

Once you've started the machine the machine configuration should be available at `~/.docker/machine/machines/dockerbuilder`. You should see `ca.pem`, `cert.pem`, and `key.pem`. These are the three certificated needed to connect remotely to the docker engine on the boot2docker machine.

Running `docker-machine ls` will reveal the IP your dockerbuilder machine is listening to:

    NAME            ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER    ERRORS
    dockerbuilder   -        virtualbox   Running   tcp://192.168.99.100:2376           v1.11.0
    

So how do we gain access to the docker-engine from our build script running inside a container? Docker Hub provides us with a [`Docker Docker image`](https://hub.docker.com/_/docker/). This image container the docker binary we need to communicate with our virtualbox hosted docker engine.

To build a docker image from within the `docker` docker container we can now simply add our certificates as variables in the Gitlab project settings and create a `.gitlab-ci.yml` build job like so:

    types:
      - dockerbuild
    
    build_docker_image:
      type: dockerbuild
      image: docker:latest
      script:
        - echo "$DOCKER_CERT_PEM" > /root/cert.pem
        - echo "$DOCKER_KEY_PEM" > /root/key.pem
        - echo "$DOCKER_CA_PEM" > /root/ca.pem
        - export DOCKER_TLS_VERIFY="1"
        - export DOCKER_HOST="tcp://192.168.99.100:2376"
        - export DOCKER_CERT_PATH="/root"
        - docker build -t username/imagename:latest .
        - docker login --username="${REGISTRY_USER}" --password="${REGISTRY_PASSWORD}" --email="${REGISTRY_EMAIL}" docker.example.com
        - docker push username/imagename:latest
    

`DOCKER_CERT_PEM` is the variable name from the Gitlab project settings and its value is the contents of the `cert.pem` file from before. The solution is a bit noisy, but could probably be moved into a shell script to reduce clutter. The important takeaway here is that we fetch the certificates that the `docker-machine create -d dockerbuilder` command generated for us and stored them in the Gitlab project settings variable page. Gitlab CI will send them to Gitlab Runner when orchestrating a build, and Gitlab Runner will make them available as environment variables in our build.

After doing some boilerplate setup by writing certificates to files and setting some docker environment variables we can freely use the docker command to communicate with the engine running at our virtualbox on address `192.168.99.100:2376`. We can then login to a docker registry and push our image there.

One note. Our virtualbox based boot2docker instance will keep all images and login info we store on it as long as it is running. Subsequent builds of our docker image will therefore be able to use pre-existing layers from previous builds. Because the build script itself is run in our `docker` docker container all data we write in it, such as our super secret certificates, will disappear into thin air together with the container when the build is done. The certificates and your connection to the virtualbox docker engine should therefore be safe. Note however that anyone with developer or master access to your Gitlab project has access to the variables on the project settings page.

---
title: Building Docker images with Gitlab CI
layout: "../../layouts/BlogPost.astro"
pubDate: "2018-02-14"
modDate: "2018-04-02"
---

Different approaches to building Docker images with Gitlab CI, drawbacks, and solutions.

My most popular blog post so far is [Setting up a Docker image builder with Gitlab CI Runner](https://snorre.io/setting-up-gitlab-ci-runner-docker-image-builder/). The focus of that post was how you could set up a relatively secure Docker build environment using Gitlab CI and a host with a Docker engine. It also touches on the subject of how to design your `.gitlab-ci.yml` pipeline to build a Docker image. I wrote that piece almost two years ago. Since then I have learned a few neat things about both Docker and Gitlab CI. There has also been some welcome updates in both Gitlab CI and Docker that has improved my docker building pipelines. In this post I will try to show you what my early implementations looked like, which problems they caused, and how later features allowed me to create better implementations. In the end this post should give you an idea about how you could go about setting up Gitlab pipelines to build your own Docker images using Gitlab CI and Docker.

## Early days

In the early days of Docker and Gitlab CI Runner. Before [Docker multistage builds](https://docs.docker.com/develop/develop-images/multistage-build/) and [Gitlab job artifacts](https://docs.gitlab.com/ce/user/project/pipelines/job_artifacts.html) building applications and putting them in clean production Docker images was not straight forward. At least not with the `docker executor`. My solution involved using the [cache](https://docs.gitlab.com/ce/ci/yaml/README.html#cache) feature to transfer build files from a _build_ stage into a _containerize_ stage and referencing them in the `Dockerfile` used for the `docker build` command. For a Node app written in Typescript using this solution might give you a `.gitlab-ci.yml` file which looks like the one below.

```yaml
stages: build
  containerize

cache:
  key: $CI_BUILD_REF
  paths:
    - dist
    - server.js
    - package.json

build:
  stage: build
  image: node:8
  script:
    - npm install
    - npm run build

containerize:
  stage: containerize
  image: docker:17
  script:
    -  # A few lines to set DOCKER_HOST and certificates and log in.
    - docker build -t user/my-typescript-image:latest
    - docker push user/my-typescript-image:latest
```

The `Dockerfile` would reference those files:

```docker
FROM node:8-alpine
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install --production
COPY ./dist /usr/src/app/
COPY ./server.js /usr/src/app/
CMD ["node" "server.js"]
```

My approach worked relatively well, but has some problems.

- The cached build files is not guaranteed to be there for the `containerize` stage.
- The build files cache for various projects will build up until the cache is cleared.
- Clearing all the cache will cause other builds using cache for actual caching purposes to slow down.
- Depending on the _cache key_ used, cache collisions could occur thus causing potential race conditions where a containerize job ends up using build files from an unrelated build job.

All in all this was not a very elegant solution, and using cache for build output is not recommended today!

## Enter Gitlab Job Artifacts

[Gitlab job artifacts](https://docs.gitlab.com/ce/user/project/pipelines/job_artifacts.html) allows you to define the artifacts produced by a Gitlab CI job and have those files and folders archived and persisted in Gitlab. The artifacts are made available to subsequent jobs in the pipeline which makes them ideal for pipelines where the output of one job should be used in later stages. Gitlab eventually added the `expire_in` option to the artifact feature which allows us to automatically clean up old build artifacts. Armed with this new feature I devised a new `.gitlab-ci.yml` pipeline:

```yaml
stages: build
  containerize

build:
  stage: build
  image: node:8
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist
      - server.js
    expire_in: 1 hour

containerize:
  stage: containerize
  image: docker:17
  script:
    -  # A few lines to set DOCKER_HOST and certificates and log in.
    - docker build -t user/my-typescript-image:latest
    - docker push user/my-typescript-image:latest
```

Here we use the `artifacts` configuration directive in the build job to instruct the CI runner to create an archive of our build files and to persist it in Gitlab for 1 hour. When the runner executes the `containerize` job it will download and extract the artifacts archive and make the files available. After 1 hour Gitlab will delete the files. Because job artifacts are stored for their specific pipelines collisions will not occur. As you might have surmised artifacts fix a lot of the issues present with the cache based approach.

## Multistage docker builds

The artifact approach above works quite well for many build scenarios. I still use it for some projects, but it does have some issues. Because the runner has to archive and upload the build files to Gitlab at the end of the `build` job, and then download and extract the files at the start of the `containerize` job, large builds could take some time to run. Because artifacts are unique per pipeline they will not help you with dependencies and build cache. For this you would have to use the Gitlab CI Runner's cache feature.

When Docker 17.05 was released it brought about the [Docker multistage build](https://docs.docker.com/develop/develop-images/multistage-build/) feature, promising a new and simpler way to build clean production images. This feature has simplified and improved how I build Docker images with Gitlab CI as the `build` stage and job can be removed in favor of a single `containerize` step using a multistage Dockerfile. In essence you would change your old `Dockerfile` to use a build and production stage.

```docker
FROM node:8 as builder
WORKDIR /usr/src/app
COPY package.json
RUN npm install
COPY ./src /usr/src/app/
RUN npm run build

FROM node:8-alpine
WORKDIR /usr/src/app
COPY package.json
RUN npm install --production
COPY --from=builder /usr/src/app/dist /usr/src/app/
COPY --from=builder /usr/src/app/server.js /usr/src/app/

CMD ["node" "server.js"]
```

The `builder` stage in the Dockerfile, not to be confused with a Gitlab CI stage, will build the app using your regular `Dockerfile` commands. When the `builder` stage is complete Docker will have made image layers for the `builder` stage. The final stage which produces your actual Docker image will start from the desired base image, here `node:8-alpine`. We can then instruct the Dockerfile to copy files from the previous stage instead of our local file system. The result is a clean production image without build dependencies.

You could then change your `.gitlab-ci.yml` file to only use one CI stage:

```yaml
stages: containerize

containerize:
  stage: containerize
  image: docker:<tag>
  script:
    -  # A few lines to set DOCKER_HOST and certificates and log in.
    - docker build -t user/my-typescript-image:latest
    - docker push user/my-typescript-image:latest
```

There are some major benefits to this approach. First of all you eliminate the overhead associated with the artifact handling in Gitlab. Second of all the image layers for your `Dockerfile`'s `builder` stage will be cached by Docker. If you have structured your `builder` stage correctly Docker might already have the layers for the correct dependencies and build cache, and Docker will happily start on the `RUN` command associated with your build (e.g. `RUN npm run build`) thus saving a lot of time. Finally the multistage Dockerfile provides a much more consistent and portable build solution. In the artifact based approach you might end up with one build setup for local use and one for Gitlab CI. A multistage Dockerfile will happily work in both environments without any differences. This makes builds and build errors more reproducible as you can simply run `docker build -t my-container .` locally on your dev machine if your build fails in Gitlab.

### Two Dockerfiles approach

Readers with lots of Docker experience might have seen a different solution that I so far did not mention. Docker has a [copy feature](https://docs.docker.com/engine/reference/commandline/cp/) which allows you to copy files _out_ of a container. A solution would thus be to have two `Dockerfile`s, one to produce build output and one to run your application. In a single `containerize` CI job you would first build a Docker image of your project producing the build output inside the image. Then you would run a container from the image and copy out the necessary files. That container could then be stopped and you would build your production image. This solution was not apparent to me at the time, and would in any case be considered quite complex. The multistage feature works on the same principle, but is far simpler to implement.

## Conclusion

We have seen how building Docker images with Gitlab CI has gone from being a somewhat involved process with workarounds involving the Gitlab CI cache to being a first class experience. Using multistage Dockerfiles allows you to run your whole build process with the `docker build` command, and reduce the complexity of your Gitlab CI pipelines. This post does not give you all the details, but should point you in the right direction.

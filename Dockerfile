FROM node:8
MAINTAINER Andy Edwards

RUN npm install --global yarn

WORKDIR /usr/app/build

ARG NPM_TOKEN

# Project uses private NPM modules. Pass in NPM token externally.
# Tell NPM to use the token from the environment variable
RUN echo "registry=https://registry.npmjs.org/" > /usr/app/build/.npmrc
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> /usr/app/build/.npmrc
RUN echo 'registry "https://registry.npmjs.org"' > /usr/app/build/.yarnrc

ARG NODE_ENV=production
ARG TARGET=""
ARG BUILD_DIR=build

ENV NODE_ENV=$NODE_ENV \
    TARGET=$TARGET

COPY package.json yarn.lock /usr/app/build/

RUN yarn --pure-lockfile || cat yarn-error.log

COPY $BUILD_DIR/ /usr/app/build/
COPY static/ /usr/app/static/

EXPOSE 80

ENV PORT=80 \
    BACKEND_PORT=80

CMD ["node", "server/index.js"]

#!/bin/bash

# https://jtuto.com/use-cmd-in-dockerfile-instead-of-entrypoint-exec-usr-local-bin-docker-entrypoint-sh-exec-format-error/
FROM --platform=linux/amd64 node:14

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .
COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8080 
CMD ["node", "dist/index.js"]
USER node
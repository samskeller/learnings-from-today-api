FROM mhart/alpine-node:12.9.0 as build

RUN apk upgrade --update-cache
RUN apk add bash
RUN apk --no-cache add --virtual builds-deps build-base python

RUN npm install knex -g

RUN mkdir /container

WORKDIR /container/
COPY . /container/

RUN npm install

CMD ["node", "app.js"]

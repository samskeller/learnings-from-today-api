FROM alpine:3.10.1 as build

RUN apk upgrade --update-cache
RUN apk add nodejs nodejs-npm bash

RUN mkdir /container

WORKDIR /container/
COPY . /container/

CMD ["node", "app.js"]

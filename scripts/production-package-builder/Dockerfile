FROM node:21.0.0-bookworm-slim

WORKDIR /usr/app
COPY /src-marged-package/package*.json ./
RUN yarn install


COPY /src-marged-package/. .

ENV WARROOM_NAME="Dev War Room Docker"
ENV WARROOM_EMAIL="docker@example.com"
ENV KEYSTORE_SECRET="dockerp@ssword"
ENV KEYSTORE_FILE="/usr/app/data/secretstore.json"
ENV WARROOMHUB_PUBLIC_KEY_FILE="/usr/app/data/publickey.pgp"
ENV WARROOMHUB_PRIVATE_KEY_SECRET="JBKd@J7csC"

RUN chown -R 1000:1000 /usr/app/data
RUN chmod 755 /usr/app/data

EXPOSE 8080
CMD [ "node", "server.js" ] 


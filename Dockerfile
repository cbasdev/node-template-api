FROM node:12.22.6-alpine3.11

WORKDIR /node-build-template
COPY . .
RUN npm install --production

CMD ["node", "/node-build-template/src/app.js"]

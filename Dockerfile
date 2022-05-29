# STAGE BUILD
FROM node:12-alpine as builder

RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app

COPY package*.json ./
RUN npm config set unsafe-perm true
RUN npm install -g typescript
RUN npm install -g ts-node

RUN npm install
COPY . .

RUN npm run build

# STAGE RUN
FROM node:12-alpine

RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package*.json ./
COPY ormconfig.js ./

RUN npm install --production
COPY --from=builder /home/node/app/dist ./dist

EXPOSE 8085
CMD [ "npm", "start" ]

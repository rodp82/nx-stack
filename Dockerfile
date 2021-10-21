FROM node:14-alpine as build

WORKDIR /app

COPY package.json .

RUN npm install

COPY . . 

RUN npm run build:api
RUN npm run build:frontend



FROM node:14-alpine as production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}
ENV PORT=80

EXPOSE 80

WORKDIR /apps

COPY package.json .

RUN npm install --only=production

COPY --from=build /app/dist/apps .

CMD ["node", "api/main"]
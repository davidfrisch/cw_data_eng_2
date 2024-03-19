FROM node:slim as build-stage

WORKDIR /app

COPY package.json /app

COPY . /app

RUN npm install

RUN npm run build

# Stage 2
FROM nginx:stable-alpine-slim

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
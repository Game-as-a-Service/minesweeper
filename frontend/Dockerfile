# build stage
FROM node:18.16.0-alpine as build-stage
WORKDIR /app/core
COPY package.json yarn.lock ./
RUN yarn
COPY /frontend ./

COPY /lib /app/lib

RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
COPY /frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/core/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

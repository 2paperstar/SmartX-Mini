FROM node:24 AS build

RUN mkdir -p /app
WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
#COPY ./app.conf /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]


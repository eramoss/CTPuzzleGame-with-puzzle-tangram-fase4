FROM node:10-slim

WORKDIR /

COPY . .

RUN npm run build

EXPOSE 8080

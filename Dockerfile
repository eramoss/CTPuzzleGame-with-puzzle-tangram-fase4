FROM node:10-slim

WORKDIR /

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

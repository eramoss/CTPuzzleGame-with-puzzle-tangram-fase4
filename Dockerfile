FROM node:10-slim

COPY . .

RUN npm run build

EXPOSE 8080

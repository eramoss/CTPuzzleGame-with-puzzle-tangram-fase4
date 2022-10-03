FROM node:10-slim

RUN npm run build

EXPOSE 8080

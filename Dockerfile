FROM node:12.21.0

WORKDIR /

COPY . .

RUN npm install
RUN npm run build

CMD ["npx", "http-server", "dist"]

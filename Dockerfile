FROM node:14.16.0

ENV NODE_ENV=production

WORKDIR /
COPY ["package.json", "yarn.lock", "./"]

RUN yarn install
COPY . .

CMD ["yarn", "start"]
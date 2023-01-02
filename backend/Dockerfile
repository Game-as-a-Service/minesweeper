FROM node:16.13.1-alpine as builder

WORKDIR /app
COPY . /app

RUN yarn install --frozen-lockfile && yarn build

# ---

FROM node:16.13.1-alpine

ENV NODE_ENV production

WORKDIR /app

# 需要 packagejson 跟 yarn.lock 提供版本資訊
COPY package.json yarn.lock ./

# --production 不安裝 dev 相關套件
# --frozen-lockfile 強制安裝 yarn.lock 套件
RUN yarn install --production --frozen-lockfile

COPY --from=builder /app/dist/ /app/dist/

EXPOSE 3000

CMD ["node", "dist/main"]

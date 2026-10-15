FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

COPY package*.json ./

FROM base AS development

RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]

FROM base AS build

RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:22-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/.next/standalone ./
COPY --from=build /usr/src/app/.next/static ./.next/static

EXPOSE 3001

CMD ["node", "server.js"]

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src ./src

# ---- runtime stage ----
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/src ./src

EXPOSE 3001

CMD ["src/server.js"]
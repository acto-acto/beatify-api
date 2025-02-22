FROM node:20-alpine

RUN npm install -g pnpm --ignore-scripts && addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts
COPY ./src ./src
COPY nest-cli.json tsconfig.build.json tsconfig.json .env ./
RUN chmod -R 755 /app && pnpm build

USER appuser

EXPOSE 3000
CMD ["pnpm", "start:prod"]
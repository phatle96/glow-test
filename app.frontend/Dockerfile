# Use Node.js image
FROM node:22-alpine

WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json tsconfig.json .env.local ./
COPY package.blocks ./package.blocks
COPY package.prisma ./package.prisma
RUN npm install

# Copy app code
COPY app.frontend ./app.frontend

WORKDIR /app/app.frontend
RUN npm install --legacy-peer-deps && \
    npx dotenvx run -f ../.env.local -- prisma generate --schema ../package.prisma/prisma/schema.prisma && \
    # npx dotenvx run -f ../.env.local -- prisma migrate deploy --schema ../package.prisma/prisma/schema.prisma && \
    npm run build:frontend

# Expose the port
EXPOSE 3000

# Start the frontend application
CMD ["npm", "run", "start:frontend"]
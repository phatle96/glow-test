# Use Node.js image
FROM node:22

WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json tsconfig.json .env.local ./
COPY package.blocks ./package.blocks
COPY package.prisma ./package.prisma
RUN npm install

# Copy app code
COPY app.api ./app.api

WORKDIR /app/app.api

RUN npm install --legacy-peer-deps && \
    npm run prisma:generate && \
    npm run prisma:migrate && \
    npm run build:api

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:api"]
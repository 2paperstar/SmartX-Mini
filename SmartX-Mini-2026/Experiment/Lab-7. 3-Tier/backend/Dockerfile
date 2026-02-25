# ---------- step 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install necessary build dependencies (for bcrypt)
RUN apk add --no-cache libc6-compat build-base

# Copy package.json and package-lock.json -> install dependencies
COPY package*.json ./
RUN npm install

# Copy Source Code
COPY . .
# Nest -> dist/
RUN npm run build           
# Create Prisma Client
RUN npx prisma generate     

# run
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

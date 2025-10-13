# Multi-stage Dockerfile for production backend
# Build stage: install dependencies and copy source
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install only dependencies (production) to keep image small
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Final runtime image
FROM node:18-alpine AS runtime

WORKDIR /usr/src/app

# Copy only what we need from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/server.js"]
# Use official Node LTS image
FROM node:18-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

# Install production dependencies only in build stage
FROM base AS deps
RUN npm ci --only=production

FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Default env
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/server.js"]
FROM node:18-alpine

WORKDIR /usr/src/app

# Install deps first (use package*.json to allow package-lock if present)
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "start"]
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Bundle app source
COPY src ./src

# Expose port (default from .env is 4000)
EXPOSE 4000

CMD ["node", "src/server.js"]

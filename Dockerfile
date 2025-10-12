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

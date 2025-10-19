# Dockerfile for frontend
FROM node:20-bullseye

WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

# Clean install inside container (Linux deps only)
RUN rm -rf node_modules && npm cache clean --force && npm ci
RUN npm install react-router-dom
# Copy rest of your app
COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vite
CMD ["npm", "run", "dev"]

# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY Backend/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY Backend/ .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/users', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]

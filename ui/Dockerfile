FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY ui/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY ui .

# Expose port
EXPOSE 3000

# Run Next.js in development mode
CMD ["npm", "run", "dev"]

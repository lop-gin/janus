# Use Node.js 14 with Alpine Linux for a lightweight base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (optimization for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app for production
# Using --no-lint flag to skip ESLint checks during build
RUN npm run build -- --no-lint

# # Expose port 3000 (default for Next.js)
# EXPOSE 3000

# Start the app
CMD ["npm", "start"]
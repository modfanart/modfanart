# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build (if needed)
# RUN npm run build

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]
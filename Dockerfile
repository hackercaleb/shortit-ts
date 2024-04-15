# Use an existing docker image as a base
FROM node:alpine AS base

# Set the working directory in the container
WORKDIR /usr/app

# Copy package.json and package-lock.json files
COPY ./package*.json ./

# Download and install dependencies
RUN npm install

# Copy the rest of the application
COPY ./ ./

# Command to run your app
CMD ["npm", "start"]

# Use an official Node.js runtime as the base image
FROM node:latest

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies inside the container
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Inform Docker that the container will listen on the specified port at runtime
EXPOSE 3000

# Define the command to run the application
CMD [ "node -r tracer.js server.js" ]

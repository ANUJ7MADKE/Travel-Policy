FROM node:23-alpine3.20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that your application will run on
EXPOSE 3000

RUN npx prisma generate

# Start the application using nodemon (for development)
CMD ["npm", "run", "dev"]

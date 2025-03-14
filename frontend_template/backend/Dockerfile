# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create a directory for the SQLite database
RUN mkdir -p data
VOLUME /app/data

# Create a symlink to store the database in the persistent volume
RUN ln -sf /app/data/chat.db /app/chat.db

EXPOSE 3001

CMD ["node", "index.js"]
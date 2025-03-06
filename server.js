const fastify = require('fastify')({ logger: true }); //call fastify object to use fastify
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');



//thx claude
// Create a database file if it doesn't exist
const dbFile = path.join(__dirname, 'chat.db');
const db = new Database(dbFile);


function initializeDatabase() {
  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  console.log('Database initialized');
}



// Add static file serving for the frontend
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});














// Define a basic route
fastify.get('/', async (request, reply) => {
  return { message: 'hoi wereldje blablablalbad' };
});

fastify.get('/test', basicHTMLpage);

function basicHTMLpage() {
  return `
  <html>
  <head>
    <title>My whatsupp gamerss</title>
  </head>
  <body>
    <h1>Hello world!</h1>
  </body>
  </html>
  `;
}


// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Server running at http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

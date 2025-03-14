// backend/index.js
const fastify = require('fastify')({
	logger: true
  });
  const Database = require('better-sqlite3');
  const path = require('path');
  
  // Database setup
  const dbFile = path.join(__dirname, 'chat.db');
  const db = new Database(dbFile);
  
  // Initialize database schema
  function initializeDatabase() {
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
  
  // Enable CORS to allow requests from frontend service
  fastify.register(require('@fastify/cors'), {
	origin: '*', // In production, set this to your frontend URL
	methods: ['GET', 'POST', 'OPTIONS']
  });
  
  // API Routes
  // Get all messages
  fastify.get('/api/messages', async (request, reply) => {
	const stmt = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 100');
	const messages = stmt.all();
	return messages;
  });
  
  // Add a new message
  fastify.post('/api/messages', async (request, reply) => {
	const { username, content } = request.body;
	
	if (!username || !content) {
	  reply.code(400);
	  return { error: 'Username and content are required' };
	}
	
	const stmt = db.prepare('INSERT INTO messages (username, content) VALUES (?, ?)');
	const result = stmt.run(username, content);
	
	return { 
	  id: result.lastInsertRowid,
	  success: true 
	};
  });
  
  // Health check endpoint
  fastify.get('/health', async () => {
	return { status: 'ok' };
  });
  
  // Start the server
  async function startServer() {
	try {
	  initializeDatabase();
	  
	  // Use environment variable for port or default to 3001
	  const port = process.env.PORT || 3001;
	  await fastify.listen({ port, host: '0.0.0.0' });
	  console.log(`Backend service running on http://localhost:${port}`);
	} catch (err) {
	  fastify.log.error(err);
	  process.exit(1);
	}
  }
  
  startServer();
// chat-frontend/index.js
const fastify = require('fastify')({
  logger: true
});
const path = require('path');
const fs = require('fs');

// Environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'; //??
const PORT = process.env.PORT || 3000;

// Register static file serving
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});

// Create frontend files
function setupFrontend() {
  const publicDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir);
  }
  
  // Create a simple HTML file for the chat interface
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple Chat</title>
  <style>
	body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
	#chat-container { border: 1px solid #ccc; height: 400px; overflow-y: auto; padding: 10px; margin-bottom: 10px; }
	.message { margin-bottom: 10px; }
	.message .username { font-weight: bold; }
	.message .content { margin-left: 5px; }
	.message .time { color: #999; font-size: 0.8em; margin-left: 10px; }
	#message-form { display: flex; }
	#message-input { flex-grow: 1; margin-right: 10px; padding: 8px; }
	button { padding: 8px 15px; background: #4285f4; color: white; border: none; cursor: pointer; }
	button:hover { background: #3367d6; }
	.service-info { margin-bottom: 10px; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>Simple Chat</h1>
  <div class="service-info">Frontend: http://localhost:${PORT} | Backend: ${BACKEND_URL}</div>
  
  <div id="chat-container"></div>
  
  <form id="username-form">
	<input type="text" id="username-input" placeholder="Choose a username" required>
	<button type="submit">Set Username</button>
  </form>
  
  <form id="message-form" style="display: none;">
	<input type="text" id="message-input" placeholder="Type a message..." required>
	<button type="submit">Send</button>
  </form>

  <script>
	// Store backend URL from environment variable
	console.log("window.location.hostname == ", window.location.hostname);
	const BACKEND_URL = window.location.hostname === 'localhost' ? 
						'http://localhost:3001' : 
						'http://' + window.location.hostname + ':3001';
	
	let username = '';
	const chatContainer = document.getElementById('chat-container');
	const usernameForm = document.getElementById('username-form');
	const messageForm = document.getElementById('message-form');
	const usernameInput = document.getElementById('username-input');
	const messageInput = document.getElementById('message-input');
	
	// Set username
	usernameForm.addEventListener('submit', function(e) {
	  e.preventDefault();
	  username = usernameInput.value.trim();
	  if (username) {
		usernameForm.style.display = 'none';
		messageForm.style.display = 'flex';
		messageInput.focus();
	  }
	});
	
	// Send message
	messageForm.addEventListener('submit', function(e) {
	  e.preventDefault();
	  const content = messageInput.value.trim();
	  if (content) {
		sendMessage(username, content);
		messageInput.value = '';
	  }
	});
	
	// Fetch messages from backend
	async function fetchMessages() {
	  try {
		const response = await fetch(\`\${BACKEND_URL}/api/messages\`);
		if (!response.ok) {
		  throw new Error('Network response was not ok');
		}
		const messages = await response.json();
		renderMessages(messages);
	  } catch (error) {
		console.error('Error fetching messages:', error);
		chatContainer.innerHTML = '<div style="color: red;">Error connecting to backend service</div>';
	  }
	}
	
	// Send a message to backend
	async function sendMessage(username, content) {
	  try {
		const response = await fetch(\`\${BACKEND_URL}/api/messages\`, {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({ username, content })
		});
		
		if (response.ok) {
		  fetchMessages();
		}
	  } catch (error) {
		console.error('Error sending message:', error);
		alert('Failed to send message. Backend may be unavailable.');
	  }
	}
	
	// Render messages in the chat container
	function renderMessages(messages) {
	  chatContainer.innerHTML = '';
	  messages.forEach(message => {
		const date = new Date(message.timestamp * 1000);
		const timeStr = date.toLocaleTimeString();
		
		const messageEl = document.createElement('div');
		messageEl.className = 'message';
		messageEl.innerHTML = \`
		  <span class="username">\${message.username}:</span>
		  <span class="content">\${message.content}</span>
		  <span class="time">\${timeStr}</span>
		\`;
		
		chatContainer.appendChild(messageEl);
	  });
	  
	  // Scroll to the bottom
	  chatContainer.scrollTop = chatContainer.scrollHeight;
	}
	
	// Check backend health
	async function checkBackendHealth() {
	  try {
		const response = await fetch(\`\${BACKEND_URL}/health\`);
		return response.ok;
	  } catch (error) {
		return false;
	  }
	}
	
	// Initialize
	async function init() {
	  const isBackendHealthy = await checkBackendHealth();
	  if (!isBackendHealthy) {
		chatContainer.innerHTML = '<div style="color: red;">Backend service is not available. Please try again later.</div>';
		return;
	  }
	  
	  // Fetch messages initially and every 3 seconds
	  fetchMessages();
	  setInterval(fetchMessages, 3000);
	}
	
	init();
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);
  console.log('Frontend files created');
}

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Start the server
async function startServer() {
  try {
	setupFrontend();
	
	await fastify.listen({ port: PORT, host: '0.0.0.0' });
	console.log(`Frontend service running on http://localhost:${PORT}`);
	console.log(`Connecting to backend at ${BACKEND_URL}`);
  } catch (err) {
	fastify.log.error(err);
	process.exit(1);
  }
}

startServer();
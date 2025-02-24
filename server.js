// // server.mjs
// import { createServer } from 'node:http';

// const server = createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Hello World!\n');
// });

// // starts a simple http server locally on port 3000
// server.listen(3000, '127.0.0.1', () => {
//   console.log('Listening on 127.0.0.1:3000');
// });


// const { createServer } = require('node:http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('WIPPhurrfuehsfiehuEEEEEEEE');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

















// run with `node server.mjs`



const fastify = require('fastify')({ logger: true });

// Define a basic route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Start the server
const start = async () => {
  try {
    await fastify.listen(3000);
    console.log(`Server running at http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

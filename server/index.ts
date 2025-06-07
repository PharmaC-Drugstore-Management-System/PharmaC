import { pool } from './db';

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const result = await pool.query('SELECT * FROM medicines');
    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
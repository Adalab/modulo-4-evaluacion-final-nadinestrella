const mysql = require('mysql2/promise');

async function connect_db() {
  const conex = await mysql.createConnection({
    host: process.env.HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: 'school',
  });
  conex.connect();

  return conex;
}

module.exports = connect_db;

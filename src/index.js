//server

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

//crear el servidor

const api = express();

api.use(cors());
api.use(express.json());

const port = process.env.PORT || 4500;

async function connect_db() {
  const conex = await mysql.createConnection({
    host: process.env.HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: 'xxx',
  });
  conex.connect();

  return conex;
}

api.listen(port, () => {
  console.log(`servidor escuchando por http://localhost:${port}`);
});

//endpoint

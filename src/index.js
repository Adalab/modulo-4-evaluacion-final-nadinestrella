//server

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//crear el servidor

const api = express();

api.use(cors());
api.use(express.json({ limit: '25mb' }));

const port = process.env.PORT || 4500;

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

const generateToken = (data) => {
  const token = jwt.sign(data, process.env.SECRET_KEY || 'super_secret_key', {
    expiresIn: '1h',
  });
  return token;
};

api.listen(port, () => {
  console.log(`servidor escuchando por http://localhost:${port}`);
});

//endpoints

//1 INSERTAR UN REGISTRO EN SU ENTIDAD PPAL

api.post('/addStudent', async (req, res) => {
  try {
    const conex = await connect_db();
    const data = req.body;
    const {
      classroom,
      name,
      lastname,
      dateOfBirth,
      location,
      photo,
      report,
      comments,
      parentId,
    } = data;

    if (!name || !lastname) {
      return res.status(400).json({
        success: false,
        message: 'Name and lastname are required',
      });
    }

    const sql =
      'INSERT INTO students (class, name_student, lastname, date_of_birth, location, photo, report, comments, fk_parent_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await conex.query(sql, [
      classroom,
      name,
      lastname,
      dateOfBirth,
      location,
      photo,
      report,
      comments,
      parentId,
    ]);

    console.log[result];
    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    let message = 'An error occurred while adding the student';
    let statusCode = 500;

    // Aquí puedes manejar errores específicos si lo deseas, por ejemplo, errores de validación de datos de entrada
    if (error.code === 'ER_BAD_NULL_ERROR') {
      // Ejemplo de manejo de un error específico de MySQL
      message = 'Missing fields for the student';
      statusCode = 400;
    }
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
});

//2 LEER/LISTAR TODOS LOS REGISTROS EXISTENTES
api.get('/students', async (req, res) => {
  try {
    const conex = await connect_db();
    const students = 'SELECT * FROM students';
    const [results] = await conex.query(students);

    res.json({
      success: true,
      result: results,
    });
  } catch (eror) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the students',
    });
  }
});

//3 LEER REGISTROS FILTRADO POR EL CAMPO DE TU INTERES

api.get('/students/:id', async (req, res) => {
  try {
    const conex = await connect_db();
    const idStudent = req.params.id;
    const query = 'SELECT name_student, report FROM students where id = ?';
    const [result] = await conex.query(query, [idStudent]);

    // Verificación si se encontraron resultados
    if (result.length > 0) {
      res.json({
        success: true,
        student: result[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching student data',
    });
  }
});

//4 ACTUALIZAR UN REGISTRO EXISTENTE

api.put('/students/:id', async (req, res) => {
  try {
    const conex = await connect_db();
    const id = req.params.id;
    const data = req.body;
    const {
      classroom,
      name,
      lastname,
      dateOfBirth,
      location,
      photo,
      report,
      comments,
      parentId,
    } = data;

    const sql =
      'UPDATE students set class= ?, name_student= ?, lastname= ?, date_of_birth= ?, location= ?, photo= ?, report= ?, comments= ?, fk_parent_id= ? WHERE id= ? ';
    const [result] = await conex.query(sql, [
      classroom,
      name,
      lastname,
      dateOfBirth,
      location,
      photo,
      report,
      comments,
      parentId,
      id,
    ]);

    res.json({
      success: true,
      message: 'actualizado correctamente',
    });
  } catch (error) {
    console.log(error);
  }
});

// 5 ELIMINAR UN REGISTRO EXISTENTE

api.delete('/students/:id', async (req, res) => {
  try {
    const conex = await connect_db();
    const idStudent = req.params.id;
    if (!idStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required',
      });
    }

    const sql = 'DELETE from students WHERE id = ?';
    const [result] = await conex.query(sql, [idStudent]);
    console.log(result);

    // Verifica si se elimino una fila

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: 'Deleted',
      });
    } else {
      res.json({
        success: false,
        message: 'Student not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the student',
    });
  }
});

//BONUS

// 6 REGISTER

api.post('/register', async (req, res) => {
  try {
    const conex = await connect_db();
    const { nameparent, email, password } = req.body;

    // Busca si ya existe un usuario con el email proporcionado
    const selectNameParent = 'SELECT * FROM parents_users_db WHERE email = ?';
    const [result] = await conex.query(selectNameParent, [email]);

    // Si no encuentra un registro, inserta
    if (result.length === 0) {
      const passwordHashed = await bcrypt.hash(password, 10);
      const insertNameParent =
        'INSERT INTO parents_users_db (nameparent, email, password) VALUES (?, ?, ?)';
      const [resultInsert] = await conex.query(insertNameParent, [
        nameparent,
        email,
        passwordHashed,
      ]);

      res.json({ success: true, data: resultInsert });
    } else {
      // Usuario ya existe
      res.status(409).json({ success: false, message: 'User already exists' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
    });
  }
});

//7 LOGIN

api.post('/login', async (req, res) => {
  const conex = await connect_db();
  const { email, password } = req.body;
  const selectStudent = 'SELECT * from parents_users_db where email = ? ';
  const [result] = await conex.query(selectStudent, [email]);

  if (result.length !== 0) {
    const isOkPass = await bcrypt.compare(password, result[0].password);

    if (isOkPass) {
      //genera token
      const infoToken = {
        id: result[0].id,
        email: result[0].email,
      };
      const token = generateToken(infoToken);
      //respuesta al usuario
      res.json({
        success: true,
        messagge: `Welcome ${email}, you are in `,
        token: token,
      });
    } else {
      res.json({
        success: false,
        mjs: 'Invalid password',
      });
    }
  } else {
    res.json({
      success: false,
      msj: 'Email does not exist',
    });
  }
});

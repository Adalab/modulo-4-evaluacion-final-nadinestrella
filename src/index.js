//server

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUI = require('swagger-ui-express');
const swaggerConfig = require('./swagger.json');
const addStudent = require('../src/controllers/addStudent.controller');
const connect_db = require('../src/config/connectDb');

//crear el servidor

const api = express();

api.use(cors());
api.use(express.json({ limit: '25mb' }));

const port = process.env.PORT || 4500;

const generateToken = (data) => {
  const token = jwt.sign(data, process.env.SECRET_KEY || 'super_secret_key', {
    expiresIn: '1h',
  });
  return token;
};

const verifyToken = (token) => {
  try {
    const verifyT = jwt.verify(
      token,
      process.env.SECRET_KEY || 'super_secret_key'
    );
    return verifyT;
  } catch (error) {
    return null;
  }
};

const authenticate = (req, res, next) => {
  const tokenBearer = req.headers['authorization'];

  if (!tokenBearer) {
    return res.status(401).json({ error: 'Token does not exist' });
  }
  const token = tokenBearer.split(' ')[1];
  const validateToken = verifyToken(token);
  if (!validateToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = validateToken;
  next();
};

api.listen(port, () => {
  console.log(`servidor escuchando por http://localhost:${port}`);
});

//endpoints

//1 INSERTAR UN REGISTRO EN SU ENTIDAD PPAL
//EN CONTROLLERS

api.post('/addStudent', async (req, res) => {
  addStudent.addStudent(req, res);
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
      message: 'Updated',
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
    const { nameparent, email, address, password } = req.body;

    // Busca si ya existe un usuario con el email proporcionado
    const selectNameParent = 'SELECT * FROM parents_users_db WHERE email = ?';
    const [result] = await conex.query(selectNameParent, [email]);

    // Si no encuentra un registro, inserta
    if (result.length === 0) {
      const passwordHashed = await bcrypt.hash(password, 10);
      const insertNameParent =
        'INSERT INTO parents_users_db (nameparent, email, address, password) VALUES (?,?, ?, ?)';
      const [resultInsert] = await conex.query(insertNameParent, [
        nameparent,
        email,
        address,
        passwordHashed,
      ]);

      res.json({
        success: true,
        data: resultInsert,
        message: `${nameparent} was registered`,
      });
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

//7 LOGIN. EMAIL AND PASSWORD

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

// 8 AUTHENTICATION. PASAR EL TOKEN

api.get('/parentProfile', authenticate, async (req, res) => {
  const conex = await connect_db();
  const sql =
    'SELECT parents_users_db.nameparent, parents_users_db.email, parents_users_db.address, students.class, students.name_student, students.lastname, students.date_of_birth, students.location, students.photo, students.report,students.comments FROM parents_users_db INNER JOIN students ON parents_users_db.id = students.fk_parent_id WHERE parents_users_db.email = ?';

  const [result] = await conex.query(sql, [req.user.email]);

  conex.end();
  res.json({ success: true, user: result });
});

//9 LOG OUT

api.put('/logout', (req, res) => {
  const tokenHeader = req.headers['authorization'];
  //const token = tokenHeader.split(' ')[1];

  jwt.sign(
    { data: '' },
    process.env.SECRET_KEY || 'super_secret_key',
    { expiresIn: 1 },
    (error, logoutToken) => {
      if (!error) {
        res.json({ message: 'Logout' });
      } else {
        res.json({ message: 'An error occurred while logging out' });
      }
    }
  );
});

api.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerConfig));

// api.put('/logout', (req, res) => {
//   try {
//     // No es necesario realizar ninguna acción de logout en un sistema JWT
//     res.json({ message: 'Logout successful' });
//   } catch (error) {
//     console.error('Error during logout:', error);
//     res.status(500).json({ message: 'An error occurred while logging out' });
//   }
// });

const connect_db = require('../config/connectDb');

const addStudent = async (req, res) => {
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
};

module.exports = {
  addStudent,
};

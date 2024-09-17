const mysql = require('mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');


const findUser = (dni, password) => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: 'localhost',
    user: 'root',
    password: 'vargas315',
    database: 'hacienda'
    });
      // Consulta SQL para buscar un usuario por correo electrónico
      const sql = 'SELECT * FROM user WHERE dni = ?';
      connection.query(sql, [dni], async (error, results, fields) => {
          if (error) {
            resolve(null);
          } else {
              if (results.length === 0) {
                  // No se encontró ningún usuario con ese correo electrónico
                  resolve(null);
              } else {
                  // Se encontró un usuario con ese correo electrónico, ahora verifica la contraseña
                  const user = results[0];
                  const passwordMatch = await bcrypt.compare(password, user.password);
                  if (passwordMatch) {
                      // La contraseña coincide, devuelve el usuario
                      ////console.log(user);
                      delete user.password;
                      resolve(user);
                  } else {
                      // La contraseña no coincide
                      resolve(null);
                  }
              }
          }
        });
        //console.log('finalizada la conexion');
      connection.end(); // Cierra la conexión después de ejecutar la consulta
  });
};

const saveUser = (User) => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'vargas315',
    database: 'costa_rica_tour'
    });

    connection.connect();
    ////console.log(User)
    if (User.id == null) {
      const sql = 'INSERT INTO user SET ?';
      connection.query(sql, User, (error, results, fields) => {
        if (error) {
          reject(error);
          return;
        }
        connection.end();
        resolve(results);
      });
    } else {
      const sql = 'UPDATE user SET user_name = ?, user_password = ?, user_email = ? WHERE id = ?';
      const values = [User.username, User.password, User.email, User.id];
      connection.query(sql, values, (error, results, fields) => {
        if (error) {
          reject(error);
          return;
        }
        connection.end();
        resolve(results);
      });
    }
  });
};
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    //console.error('Error al generar el hash de la contraseña:', error);
    throw error;
  }
};


module.exports = {
  saveUser
}
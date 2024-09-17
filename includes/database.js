const mysql = require('mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const { writeFile } = require('fs').promises;
const path = require('path');
// Función para encontrar y leer el archivo de la base de datos
const findBD = async (file) => {
  const folderPath = path.join(__dirname, '../database'); // Ruta absoluta para la carpeta 'database'
  const exist = await checkFolder(folderPath);
console.log(folderPath);
  if (exist == 0 || exist == 1) {
    const filePath = path.join(folderPath, file); // Construir la ruta del archivo
    const data = await checkFile(filePath);
    return data;
  } else {
    return false;
  }
};

// Verificar si la carpeta existe y crearla si es necesario
const checkFolder = (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.access(folderPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('La carpeta no existe.');
        // Si la carpeta no existe, crearla
        fs.mkdir(folderPath, { recursive: true }, (err) => {
          if (err) {
            console.error('Error al crear la carpeta:', err);
            reject('-1');
          } else {
            console.log('Carpeta creada exitosamente.');
            resolve('1');
          }
        });
      } else {
        console.log('La carpeta ya existe.');
        resolve('0');
      }
    });
  });
};

// Verificar si el archivo existe y leerlo o crearlo si no existe
const checkFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const contenidoNuevo = JSON.stringify([]); // Contenido inicial si el archivo no existe

    // Verificar si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Si el archivo no existe, crearlo
        fs.writeFile(filePath, contenidoNuevo, (err) => {
          if (err) {
            console.error('Error al crear el archivo:', err);
            reject('-1');
          } else {
            console.log('Archivo creado exitosamente.');
            resolve('[]'); // Archivo vacío en formato JSON
          }
        });
      } else {
        // Leer el archivo si ya existe
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error al leer el archivo:', err);
            reject('-1');
          } else {
            console.log('Archivo leído exitosamente.');
            resolve(data); // Devuelve el contenido del archivo
          }
        });
      }
    });
    });
};


// Función para escribir datos en un archivo de la base de datos con promesa
const writeBD = (file, data) => {
  return new Promise((resolve, reject) => {
    const dataText = JSON.stringify(data); // JSON con formato legible
    try {
      const folderPath = path.join(__dirname, '../database'); // Ruta absoluta para la carpeta 'database'
      const filePath = path.join(folderPath, file); // Ruta absoluta para el archivo
      console.log(folderPath);
      
      // Escribir los datos en el archivo
      fs.writeFile(filePath, dataText, 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir el archivo:', err);
          reject(err); // Rechaza la promesa en caso de error
        } else {
          console.log('Archivo guardado correctamente en', filePath);
          resolve(); // Resuelve la promesa si la escritura es exitosa
        }
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      reject(error); // Rechaza la promesa en caso de error inesperado
    }
  });
};


const writeXML = async (dni,folder,file,data) => {
  // Convertir el objeto a formato JSON
  //const datosJSON = JSON.stringify(data, null, 2); // El segundo argumento es para dar formato al JSON (espacios de sangrado)
  const nombreArchivo = './database/'+dni+'/'+folder+'/xml/'+file+'.xml';

  // Escribir el JSON en un archivo de texto
  fs.writeFile(nombreArchivo, data, (err) => {
    if (err) {
      //console.error('Error al escribir el archivo:', err);
      return false;
    }
    ////console.log('Archivo guardado correctamente como', nombreArchivo);
  });
  return true;
}

const findUserID = (id) => {
  return new Promise((resolve, reject) => {
    let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
      // Consulta SQL para buscar un usuario por correo electrónico
      const sql = 'SELECT * FROM user WHERE id = ?';
      connection.query(sql, [id], async (error, results, fields) => {
          if (error) {
            resolve(null);
          } else {
              if (results.length == 0) {
                  // No se encontró ningún usuario con ese correo electrónico
                  resolve(null);
              } else {
                  // Se encontró un usuario con ese correo electrónico, ahora verifica la contraseña
                  const user = results;
                  resolve(user);
              }
          }
        });
        ////console.log('finalizada la conexion');
      connection.end(); // Cierra la conexión después de ejecutar la consulta
  });
};

const findUserDNI = (dni) => {
  return new Promise((resolve, reject) => {
    let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
      // Consulta SQL para buscar un usuario por correo electrónico
      const sql = 'SELECT * FROM user WHERE dni = ?';
      connection.query(sql, [dni], async (error, results, fields) => {
          if (error) {
            resolve(null);
          } else {
              if (results.length == 0) {
                  // No se encontró ningún usuario con ese correo electrónico
                  resolve(null);
              } else {
                  // Se encontró un usuario con ese correo electrónico, ahora verifica la contraseña
                  const user = results;
                  resolve(user);
              }
          }
        });
        ////console.log('finalizada la conexion');
      connection.end(); // Cierra la conexión después de ejecutar la consulta
  });
};


const findUser = (dni, password) => {
  return new Promise((resolve, reject) => {
    let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
      // Consulta SQL para buscar un usuario por correo electrónico
      const sql = 'SELECT * FROM user WHERE dni = ?';
      connection.query(sql, [dni], async (error, results, fields) => {
          if (error) {
            resolve(null);
          } else {
              if (results.length == 0) {
                  // No se encontró ningún usuario con ese correo electrónico
                  resolve(null);
              } else {
                  // Se encontró un usuario con ese correo electrónico, ahora verifica la contraseña
                  const user = results[0];
                  const passwordMatch = await bcrypt.compare(password, user.password);
                  if (passwordMatch) {
                      // La contraseña coincide, devuelve el usuario
                      //////console.log(user);
                      delete user.password;
                      resolve(user);
                  } else {
                      // La contraseña no coincide
                      resolve(null);
                  }
              }
          }
        });
        ////console.log('finalizada la conexion');
      connection.end(); // Cierra la conexión después de ejecutar la consulta
  });
};

const findAll = () => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
  return new Promise((resolve, reject) => {
      connection.connect((err) => {
          if (err) {
              //console.error('Error al conectar a la base de datos:', err);
              reject(err);
              return;
          }
          ////console.log('Conexión exitosa a la base de datos MySQL');
          connection.query('SELECT * FROM user', (err, rows) => {
              if (err) {
                  //console.error('Error al ejecutar la consulta:', err);
                  reject(err);
                  return;
              }
              resolve(rows);
              connection.end();
          });
      });
  });
}

const findAllUserNoConfirmed = () => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
  return new Promise((resolve, reject) => {
      connection.connect((err) => {
          if (err) {
              //console.error('Error al conectar a la base de datos:', err);
              reject(err);
              return;
          }
          ////console.log('Conexión exitosa a la base de datos MySQL');
          connection.query('SELECT * FROM user WHERE verified_admin = 0', (err, rows) => {
              if (err) {
                  //console.error('Error al ejecutar la consulta:', err);
                  reject(err);
                  return;
              }
              resolve(rows);
              connection.end();
          });
      });
  });
}
const findUserNoConfirmed = (id) => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
  return new Promise((resolve, reject) => {
      connection.connect((err) => {
          if (err) {
              //console.error('Error al conectar a la base de datos:', err);
              reject(err);
              return;
          }
          ////console.log('Conexión exitosa a la base de datos MySQL');
          connection.query('SELECT * FROM user WHERE id = ?', [id], (err, rows) => {
              if (err) {
                  //console.error('Error al ejecutar la consulta:', err);
                  reject(err);
                  return;
              }
              resolve(rows);
              connection.end();
          });
      });
  });
}


const saveUser = (User) => {
  return new Promise((resolve, reject) => {
    let connection = null;
    if(process.env.ENVIRONMENT == '1') {
            connection = mysql.createConnection({

        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }

    connection.connect();
    //////console.log(User)
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
      const sql = 'UPDATE user SET username = ?, password = ?, dni = ?, email = ?, tel = ?, admin = ?, created = ?, verified = ?, verified_admin = ?, payment = ?, token = ? WHERE id = ?';
      const values = [User.username, User.password, User.dni, User.email, User.tel, User.admin, User.created, User.verified, User.verified_admin, User.payment, User.token, User.id];
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

const gettoken = async () => {
  const length = 30;
  const buffer = crypto.randomBytes(length);
  const token = buffer.toString('hex');
  return token;
};

const sync = (userObject, resultFromMySQL) => {
  // Verificar si se encontraron resultados en MySQL
  if (resultFromMySQL.length == 0) {
    return null; // Retornar null si no se encontró ningún usuario
  }
  // Sincronizar el objeto de usuario con el primer resultado de MySQL
  const userFromMySQL = resultFromMySQL[0]; // Tomar solo el primer resultado
  for (const key in userObject) {
    if (userFromMySQL.hasOwnProperty(key)) {
      userObject[key] = userFromMySQL[key]; // Sincronizar las propiedades del usuario
    }
  }
  return userObject; // Retornar el objeto de usuario sincronizado
};



const findBranch = (id) => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
  return new Promise((resolve, reject) => {
      connection.connect((err) => {
          if (err) {
              //console.error('Error al conectar a la base de datos:', err);
              reject(err);
              return;
          }
          ////console.log('Conexión exitosa a la base de datos MySQL');
          connection.query('SELECT * FROM branch WHERE admin = ?', [id], (err, rows) => {
              if (err) {
                  //console.error('Error al ejecutar la consulta:', err);
                  reject(err);
                  return;
              }
              resolve(rows);
              connection.end();
          });
      });
  });
}
const findBranchLastAdded = (id) => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }

  return new Promise((resolve, reject) => {
      connection.connect((err) => {
          if (err) {
              //console.error('Error al conectar a la base de datos:', err);
              reject(err);
              return;
          }
          ////console.log('Conexión exitosa a la base de datos MySQL');
          connection.query('SELECT * FROM branch WHERE admin = ?', [id], (err, rows) => {
              if (err) {
                  //console.error('Error al ejecutar la consulta:', err);
                  reject(err);
                  return;
              }

              if (rows.length > 0) {
                  const maxSucursal = rows.reduce((max, row) => {
                      return (row.sucursal > max.sucursal) ? row : max;
                  }, rows[0]);

                  resolve(maxSucursal);
              } else {
                  resolve(null); // Si no hay filas, devuelve null
              }

              connection.end();
          });
      });
  });
};


const findBranchFromID = (id) => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
  return new Promise((resolve, reject) => {
      connection.connect((err) => {
          if (err) {
              //console.error('Error al conectar a la base de datos:', err);
              reject(err);
              return;
          }
          ////console.log('Conexión exitosa a la base de datos MySQL');
          connection.query('SELECT * FROM branch WHERE id = ?', [id], (err, rows) => {
              if (err) {
                  //console.error('Error al ejecutar la consulta:', err);
                  reject(err);
                  return;
              }
              resolve(rows);
              connection.end();
          });
      });
  });
}




const saveBranch = async (branch) => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
  connection.connect();
    // Insertar un nuevo Branch
    connection.query('INSERT INTO branch (admin, sucursales, sucursal) VALUES (?, ?, ?)', [branch.admin, branch.sucursales,branch.sucursal], (err, result) => {
      if (err) {
        //console.error('Error al insertar el Branch:', err);
        return;
      }
      ////console.log('Nuevo Branch insertado correctamente:', result.affectedRows);
    });
  connection.end();
}

const updateBranch = async (branch) => {
  let connection = null;
    if(process.env.ENVIRONMENT == '1') {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_1,
        user: process.env.DB_USER_1,
        password: process.env.DB_PASS_1,
        database: process.env.DB_NAME_1
      });
    } else {
      connection = mysql.createConnection({
        host: process.env.DB_HOST_0,
        user: process.env.DB_USER_0,
        password: process.env.DB_PASS_0,
        database: process.env.DB_NAME_0
      });
    }
  connection.connect();
    // Actualizar el Branch existente
    connection.query('UPDATE branch SET sucursales = ? WHERE admin = ?', [branch.sucursales, branch.admin], (err, result) => {
      if (err) {
        //console.error('Error al actualizar el Branch:', err);
        return;
      }
      ////console.log('Branch actualizado correctamente:', result.affectedRows);
    });
  connection.end();
}

const findHistorialCredito = async (client,factura) => {
  const creditosText = await findBD(user.dni,branch.folder,'historial_abono_creditos.json');
}
const findHistorialApartado = async (client,factura) => {
  const apartadosText = await findBD(user.dni,branch.folder,'historial_abono_apartados.json');

}

module.exports = {
    findAll,
    hashPassword,
    gettoken,
    saveUser,
    findUser,
    findAllUserNoConfirmed,
    findUserNoConfirmed,sync,findUserID,findUserDNI,
    findBranch,findHistorialCredito,findHistorialApartado,
    findBD,saveBranch,updateBranch,findBranchFromID,checkFolder,checkFile,writeBD,writeXML,findBranchLastAdded
}

const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_estudiantes'
};

// Función para medir el tiempo de ejecución
function measureTime(fn) {
  return new Promise(async (resolve) => {
    console.time(fn.name);
    await fn();
    console.timeEnd(fn.name);
    resolve();
  });
}

// 1️ Conexión Básica (callback)
function conexionBasica() {
  return new Promise((resolve) => {
    const connection = mysql.createConnection(dbConfig);
    connection.connect((err) => {
      if (err) throw err;
      let queriesCompleted = 0;

      for (let i = 0; i < 10; i++) {
        connection.query('SELECT * FROM users', (err, results) => {
          if (err) throw err;
          if (++queriesCompleted === 10) {
            connection.end();
            resolve();
          }
        });
      }
    });
  });
}

// 2️ Conexión con Promesas
async function conexionPromesas() {
  const connection = await mysqlPromise.createConnection(dbConfig);
  for (let i = 0; i < 10; i++) {
    await connection.execute('SELECT * FROM users');
  }
  await connection.end();
}

// 3️ Conexión con Pooling
async function conexionPooling() {
    const pool = mysql.createPool({
        ...dbConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      }).promise(); 
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(pool.query('SELECT * FROM users')); 
      }
      await Promise.all(promises);
      await pool.end();
}

// Ejecutar las pruebas
(async function runTests() {
  console.log('📌 Iniciando pruebas de rendimiento...');
  await measureTime(conexionBasica);
  await measureTime(conexionPromesas);
  await measureTime(conexionPooling);
})();
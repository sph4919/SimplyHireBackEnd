const mysql = require('mysql2');

//database connection
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect(err => 
  {
   if (err) return console.error('MySQL Error:', err);
   console.log('Connected to MySQL');
  }); 

  module.exports = db;
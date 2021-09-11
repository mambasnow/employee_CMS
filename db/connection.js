const mysql = require('mysql2');
const util = require('util');

const connection = mysql.createConnection({
    host:"localhost",
    port:"3001",
    user: "root",
    password: "test1",
    database: "Employee_CMS",    
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});


connection.query = util.promisify(connection.query);

module.exports = connection
// all dependencies required
const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require("util");
require("console.table");
require("dotenv").config();

// connect to sql using dotenv
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// connect mysql server and database
connection.connect((err) => {
  if (err) throw err;
  start();
});

// promisify connection queries
connection.query = util.promisify(connection.query);

// Promt start
const start = () => {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "See All Departments":
          allDepts();
          break;
        case "View All Roles":
          allRoles();
          break;
        case "View All Employees":
          allEmployees();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
};

const allDepts = () => {
  connection.query(
    "SELECT department.id, department.name FROM department",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
};

const allRoles = () => {
  connection.query(
    "SELECT role.id, role.title, role.salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
};

const allEmployees = () => {
  connection.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee AS manager RIGHT JOIN employee ON employee.manager_id = manager.id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
};

// add functions
const addDepartment = () => {
  inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "What is the name of the department?",
    })
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.name,
        },
        (err) => {
          if (err) throw err;
          console.log(`Added ${answer.name} department to the database`);
          start();
        }
      );
    });
};

const addRole = async () => {
  inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "What is the title of the role?",
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary of the role?",
      },
      {
        name: "departmentId",
        type: "list",
        message: "What department is the role in?",
        choices: await departmentChoices(),
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO role SET ?",
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId,
        },
        (err) => {
          if (err) throw err;
          console.log(`Added ${answer.title} role to the database`);
          start();
        }
      );
    });
};

const addEmployee = async () => {
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: `What is the employee's first name?`,
      },
      {
        name: "lastName",
        type: "input",
        message: `What is the employee's last name?`,
      },
      {
        name: "roleId",
        type: "list",
        message: `What is the employee's role?`,
        choices: await roleChoices(),
      },
      {
        name: "managerId",
        type: "list",
        message: `Who is the employee's manager?`,
        choices: await employeeChoices(),
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        (err) => {
          if (err) throw err;
          console.log(
            `Added ${answer.firstName} ${answer.lastName} to the database`
          );
          start();
        }
      );
    });
};

// update function
const updateEmployeeRole = async () => {
  inquirer
    .prompt([
      {
        name: "id",
        type: "list",
        message: `Which employee's role do you want to update?`,
        choices: await employeeChoices(),
      },
      {
        name: "roleId",
        type: "list",
        message: `What is the employee's new role?`,
        choices: await roleChoices(),
      },
    ])
    .then((answer) => {
      connection.query(
        "UPDATE employee SET ? WHERE ?",
        [
          {
            role_id: answer.roleId,
          },
          {
            id: answer.id,
          },
        ],
        (err) => {
          if (err) throw err;
          console.log(`Updated employee's role`);
          start();
        }
      );
    });
};

// get choices
const departmentChoices = async () =>
  await connection.query(
    "SELECT department.name AS name, department.id AS value FROM department ORDER BY name"
  );

const roleChoices = async () =>
  await connection.query(
    "SELECT role.title AS name, role.id AS value FROM role ORDER by name"
  );

const employeeChoices = async () =>
  await connection.query(
    `SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name, employee.id AS value FROM employee ORDER BY name`
  );
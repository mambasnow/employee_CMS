const inquirer = require('inquirer');
const logo = require('asciiart-logo');


const promptOptions = [
    "View Departments",
    "View Roles",
    "View Employees",
    "Update Employees",
    "Exit"
];

const startLogo = () => {
    const logoText = logo({ name: "Employee CMS" }).render();
  
    console.log(logoText);
  
    loadMainPrompts();
  }
  

  const mainLoad = () => {

  }
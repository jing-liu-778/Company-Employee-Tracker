const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');


// connect to database
const db =  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'company_db'
  },
  console.log(`Connected to the movies_db database.`));

  db.connect((err)=>{
      if(err) throw err;
      afterConnection();
  })
// function after connection is established and welcome image shows 
afterConnection = () => {
    console.log("***********************************")
    console.log("*                                 *")
    console.log("*        EMPLOYEE MANAGER         *")
    console.log("*                                 *")
    console.log("***********************************")
    promptUser();
  };

  // inquerier prompt 
  const promptUser = () => {
    inquirer.prompt ([
      {
        type: 'list',
        name: 'choices', 
        message: 'What would you like to do?',
        choices: ['View all departments', 
                  'View all roles', 
                  'View all employees', 
                  'Add a department', 
                  'Add a role', 
                  'Add an employee', 
                  'Update an employee role',
                  'Update an employee manager',
                  "View employees by department",
                  'Delete a department',
                  'Delete a role',
                  'Delete an employee',
                  'No Action']
      }
    ])
      .then((answers) => {
        const { choices } = answers; 
  
        if (choices === "View all departments") {
          showDepartments();
        }
  
        if (choices === "View all roles") {
          showRoles();
        }
  
        if (choices === "View all employees") {
          showEmployees();
        }
  
        if (choices === "Add a department") {
          addDepartment();
        }
  
        if (choices === "Add a role") {
          addRole();
        }
  
        if (choices === "Add an employee") {
          addEmployee();
        }
  
        if (choices === "Update an employee role") {
          updateEmployee();
        }
  
        if (choices === "Update an employee manager") {
          updateManager();
        }
  
        if (choices === "View employees by department") {
          employeeDepartment();
        }
  
        if (choices === "Delete a department") {
          deleteDepartment();
        }
  
        if (choices === "Delete a role") {
          deleteRole();
        }
  
        if (choices === "Delete an employee") {
          deleteEmployee();
        }
  
        if (choices === "No Action") {
          db.end()
      };
    });
  };

  //show department 
  // showDepartments=()=>{
  //     const sql =`SELECT department.id, department.department_name as name FROM department;`;
  //     db.query(sql, (err, rows) => {
  //       if (err) throw err;
  //         console.table(rows);
  //         promptUser();
  //       });
  //   };
    showDepartments=()=>{
      const sql =`SELECT department.id, department.department_name as name FROM department;`;
      db.promise().query(sql)
        .then(([rows])=> {
          console.table(rows);
          promptUser()})
        .catch(error => console.log("error-> ", error))
    };

// show roles
showRoles=()=>{
    const sql =`SELECT roles.id, roles.title,  department.department_name AS department, roles.salary
    FROM roles
    LEFT JOIN department ON roles.department_id = department.id;`;
    db.promise().query(sql)
      .then(([rows])=> {
        console.table(rows);
        promptUser()})
      .catch(error => console.log("error-> ", error))
      };

// show employee
showEmployees=()=>{
    const sql =`SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    roles.title, 
    department.department_name AS department, 
    roles.salary, 
    CONCAT(manager.first_name, " ", manager.last_name) AS manager
    FROM employee
    LEFT JOIN roles ON employee.role_id = roles.id
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id;`;
    db.promise().query(sql)
      .then(([rows])=> {
        console.table(rows);
        promptUser()})
      .catch(error => console.log("error-> ", error))

};

// add a department 
addDepartment =()=>{

    inquirer.prompt ([
        {
          type: 'input',
          name: 'addDept', 
          message: 'What is the name of the department?',
          validate: (value)=>{
            if(value){return true;
                }else{
                console.log("Please enter a department");
                return false;
                }
            }
        }
    ]).then((answers)=>{

        const sql = `INSERT INTO department(department_name) VALUES(?)`;
        db.promise().query(sql, answers.addDept)
        .then(()=> {console.log(`Added ${answers.addDept} to deparment`);showDepartments()})
        .catch(error => console.log("error-> ", error))
    })
};

 // add a role
addRole=()=>{
  inquirer.prompt ([
        {
           type: 'input',
           name: 'role', 
           message: 'What is the name of the role?',
           validate: (value)=>{
             if(value){return true;
                 }else{
                 console.log("Please enter a role");
                 return false;
                 }
             }
         },
         {

             type: 'input',
             name: 'salary', 
             message: 'What is the salary of the role?',
            validate: (value)=>{
              if(parseInt(value) >0 ){ 
                  
                  return true;
              }else{console.log("Please enter a possitive number greater than zero");
                 return false;
                  }
          }
         },
 ])
 .then(answer=>{
   const params = [answer.role, answer.salary];
   const roleSql = `SELECT id , department_name FROM department`;
   db.promise().query(roleSql)
      .then((data)=>{
        // console.log(data[0])
        // make the choices object list for the prompt question
        const dept = data[0].map(({department_name, id})=>({name: department_name, value:id}));
        // console.log('show dept--->', dept)


        inquirer.prompt([
          {
            type:'list',
            name:'dept',
            message:'What department is this role in?',
            choices:dept
          }
          ])
          .then((answer)=>{
              const dept = answer.dept;
              params.push(dept);
              const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`; 
              db.promise().query(sql, params)
              .then(()=>{ console.log('Added ' + answer.role + " to roles!"); showRoles() })
              .catch(err=> console.log(err))
            })
        }     
    
    
    
    );
      });
  }
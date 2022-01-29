const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { abort } = require('process');


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
                  "View employees by manager",
                  "View employees by department",
                  'Delete a department',
                  'Delete a role',
                  'Delete an employee',
                  "View department budgets",
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
        if (choices === "View employees by manager"){
          employeeManager();
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
        if (choices === "View department budgets") {
          viewBudget();
        }
        if (choices === "No Action") {
          db.end()
      };
    });
  };

  /*---------------------------show department da.query without promise------------------------------
   showDepartments=()=>{
       const sql =`SELECT department.id, department.department_name as name FROM department;`;
       db.query(sql, (err, rows) => {
         if (err) throw err;
           console.table(rows);
           promptUser();
         });
     };
  ---------------------------------------------------------------------------------------------*/
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
        // console.log("input answer--->", answers)
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
  // console.log("input answer--->", answer)
   const params = [answer.role, answer.salary];
   const roleSql = `SELECT id , department_name FROM department`;
   db.promise().query(roleSql)
      .then((data)=>{
         console.log(data[0])
        //------ make the choices object list for the prompt question
        const dept = data[0].map(({department_name, id})=>({name: department_name, value:id}));
        //  console.log('show dept--->', dept)


        inquirer.prompt([
          {
            type:'list',
            name:'depts',
            message:'What department is this role in?',
            choices:dept
          }
          ])
          .then((answer)=>{
            // console.log(answer)
              const dept = answer.depts;
              // console.log(dept)
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

  //add an employee
addEmployee=()=>{
    inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: addFirst => {
          if (addFirst) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: addLast => {
          if (addLast) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
    .then((answer)=>{
      const params = [answer.firstName, answer.lastName]

      // get roles from roles table
      const roleSql =`SELECT roles.id, roles.title FROM roles`;
      db.promise().query(roleSql)
      .then((data)=>{
        const roles = data[0].map(({id, title})=>({name:title, value:id}));
        inquirer.prompt([
          {
            type:'list',
            name:'role',
            message:"What is the emoplyee's role?",
            choices:roles
          }
        ])
        .then(roleChoice=>{
          // console.log("prompt answer---->", roleChoice);
           const role = roleChoice.role;
          // console.log("role---->",role)
          params.push(role);
          const managerSql =`SELECT * FROM employee `

          db.promise().query(managerSql)
          .then((data)=>{
            const managers = data[0].map(({id, first_name, last_name})=>({name:first_name+ " "+ last_name, value:id}));
            inquirer.prompt([
              {
                type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers
              }
          ])
          .then(managerChoice=>{
            const manager = managerChoice.manager;
            params.push(manager);
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES (?, ?, ?, ?)`;
          
            db.query(sql, params, (err,result)=>{
            if (err) throw err;
                    console.log("Employee has been added!")

                    showEmployees();
          })
          })
        })
      })
    })
  
   /*------another way to get all employee list: use forEach method--------------------
    db.query('SELECT * FROM employee', (err, emplRes) => {
      console.log("empRes---->", emplRes)
     if (err) throw err;
     const employeeChoice = [
       {
         name: 'None',
         value: 0
       }
     ]; //an employee could have no manager
     emplRes.forEach(({ first_name, last_name, id }) => {
       employeeChoice.push({
         name: first_name + " " + last_name,
         value: id
       });
     });
     //get role list 
     db.promise().query('SELECT * FROM roles')
     .then 

   })
  -------------------------------------------------------------------*/
  /*----------------------use promise--------------------------------------------
   db.promise().query('SELECT * FROM employee')
   .then(emplRes=>console.log("empRes---->", emplRes))
   -----------------------------------------------------------------------------------------------*/
})
}

//update an employee role

updateEmployee=()=>{
  const sql =`SELECT * FROM employee`;
  db.promise().query(sql)
  .then((data)=>{
    const employees = data[0].map(({first_name, last_name, id})=>({name:first_name+" "+last_name, value:id}));
    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])
    .then((empChoice=>{
      const employee = empChoice.name;
      const params=[];
      params.push(employee);
      const roleSql =`SELECT * FROM roles`;
      db.promise().query(roleSql)
      .then((data)=>{
        const roles = data[0].map(({id, title})=>({name:title, value:id}));
        inquirer.prompt([
          {
            type: 'list',
                name: 'role',
                message: "What is the employee's new role?",
                choices: roles
          }
        ])
        .then((roleChoice)=>{
          const role = roleChoice.role;
          params.push(role);
          // console.log(params);
          const sql =`UPDATE employee SET role_id=? WHERE id =?`;
          db.promise().query(sql, [params[1], params[0]])
          .then(()=>{
                    console.log('Employee has been update!');
                    showEmployees();})
        })
      })
    }));
  })
};

// update employee manager
updateManager=()=>{
  const sql = `SELECT * FROM employee`;
  db.promise().query(sql)
  .then((data)=>{
    const employees = data[0].map(({first_name, last_name, id})=>({name:first_name+" "+last_name, value:id}));
    const managers = data[0].map(({first_name, last_name, id})=>({name:first_name+" "+last_name, value:id}));
    inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: "Which employee would you like to update?",
        choices: employees


      },
      {
        type: 'list',
        name: 'manager',
        message: "Who is employee's manager?",
        choices: managers
      }
    ])
    .then((choice)=>{
      employee= choice.employee;
      manager = choice.manager;
      const params=[];
      params.push(manager);
      params.push(employee);

      const managerSql = `UPDATE employee SET manager_id=? WHERE id=?`;
      db.promise().query(managerSql,params)
      .then(()=>{
        console.log( "Manger has been updated!");
        showEmployees();
      })
    })
  })
}

// -------------------------------------------view employee list by selected department---------------------------------------------------
employeeDepartment=()=>{
  const sql = `SELECT* FROM department`;
  db.promise().query(sql)
  .then((data)=>{
    const department= data[0].map(({id, department_name})=>({name:department_name,value:id}));
    inquirer.prompt([
      {
        type: 'list', 
        name: 'departments',
        message: "Whitch manger do you select?",
        choices: department

      }
    ])
    .then((departmentChoice)=>{
      const departmentId = departmentChoice.departments;
      const employeeSql = `SELECT employee.first_name, 
      employee.last_name, 
      department.department_name AS department
FROM employee 

LEFT JOIN roles ON employee.role_id = roles.id 
LEFT JOIN department ON roles.department_id = department.id
WHERE department_id=?`;
      db.promise().query(employeeSql, departmentId)
      .then(([rows])=>{
        console.table(rows);
        promptUser()
      })

    })
  })
}
/*-----------------------------------view employees whole list with with department--------------------------------------------
 employeeDepartment=()=>{
   const sql = `SELECT employee.first_name, 
   employee.last_name, 
   department.department_name AS department
 FROM employee 
 LEFT JOIN roles ON employee.role_id = roles.id 
 LEFT JOIN department ON roles.department_id = department.id`;
 db.promise().query(sql)
 .then(([rows])=> {
   console.table(rows);
   promptUser()})
 .catch(error => console.log("error-> ", error))

 };
--------------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------This is to see whole list with employee and managers-------------------------------
// -----view employee by manager----
  employeeManager=()=>{
        const sql = `SELECT 
  sub.id, 
  sub.first_name ,
  sub.last_name ,
  CONCAT(sup.first_name, " ", sup.last_name) AS manager
  FROM employee sub JOIN employee sup ON sub.manager_id = sup.id`;
  db.promise().query(sql)
  .then(([rows])=> {
   console.table(rows);
   promptUser()})
  .catch(error => console.log("error-> ", error))
  };
---------------------------------------------------------------------------------------------------------------------*/

//-----------------------------------------------------This is see employee list by selected manager--------------------------

employeeManager = ()=>{
   const sql = `SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Inner JOIN employee m ON e.manager_id = m.id`;
  db.promise().query(sql)
   .then((data)=>{
    // console.log(data);
     const manager = data[0].map(({id, manager})=>({name: manager, value:id}));
  
      // console.log( "manager list---->",  manager);
      inquirer.prompt([
        {
          type: 'list', 
        name: 'managers',
        message: "Whitch manger do you select?",
        choices: manager
        }
      ])
      .then((managerChoice)=>{
        const managerId = managerChoice.managers;
        // console.log( "manager id---->",  managerId)
        const employeeSql= `SELECT first_name, last_name FROM employee WHERE manager_id =?`;
        db.promise().query(employeeSql, managerId)
        .then(([rows])=>{
          console.table(rows);
          promptUser();
        })
      })
   })
   
 };
// delete department
deleteDepartment=()=>{
  const deptSql =`SELECT * FROM department`;
  db.promise().query(deptSql)
  .then((data)=>{
    const dept= data[0].map(({id, department_name})=>({name:department_name, value:id}));
    inquirer.prompt([
      {
        type: 'list', 
        name: 'dept',
        message: "What department do you want to delete?",
        choices: dept
      }
    ])
    .then((deleChoice)=>{
      const dept = deleChoice.dept;
      const sql =`DELETE FROM department WHERE id = ?`;
      db.promise().query(sql, dept)
      .then(()=>{console.log("Suceessful deleted");
                showDepartments()})
    })
  })
}

// delete a role
deleteRole=()=>{
  const roleSql =`SELECT * FROM roles`;
  db.promise().query(roleSql)
  .then((data)=>{
    const role= data[0].map(({id, title})=>({name:title, value:id}));
    inquirer.prompt([
      {
        type: 'list', 
        name: 'roles',
        message: "What role do you want to delete?",
        choices: role
      }
    ])
    .then((deleChoice)=>{
      const role = deleChoice.roles;
      const sql =`DELETE FROM roles WHERE id = ?`;
      db.promise().query(sql, role)
      .then(()=>{console.log("Suceessful deleted");
                showRoles()})
    })
  })
}


// delete employee
deleteEmployee=()=>{
  const empSql =`SELECT * FROM employee`;
  db.promise().query(empSql)
  .then((data)=>{
    const employee= data[0].map(({id, first_name, last_name})=>({name:first_name+" "+last_name, value:id}));
    inquirer.prompt([
      {
        type: 'list', 
        name: 'employees',
        message: "What employee do you want to delete?",
        choices: employee
      }
    ])
    .then((deleChoice)=>{
      const employee = deleChoice.employees;
      const sql =`DELETE FROM employee WHERE id = ?`;
      db.promise().query(sql, employee)
      .then(()=>{console.log("Suceessful deleted");
                showEmployees()})
    })
  })
}

// view budget 
viewBudget=()=>{
  const sql =`SELECT  department.id,
  department.department_name as department, 
  SUM(roles.salary) AS budget
FROM  roles
LEFT JOIN department on department.id = roles.department_id
GROUP BY department.id`;
db.promise().query(sql)
.then(([rows])=>{
  console.table(rows);
  promptUser();
})
};
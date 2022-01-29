-- show employee
SELECT employee.id, 
        employee.first_name, 
        employee.last_name, 
        roles.title, 
        department.department_name AS department, 
        roles.salary, 
        CONCAT(manager.first_name, " ", manager.last_name) AS manager
FROM employee
LEFT JOIN roles ON employee.role_id = roles.id
LEFT JOIN department ON roles.department_id = department.id
LEFT JOIN employee manager ON employee.manager_id = manager.id;

-- show roles
SELECT roles.id, roles.title,  department.department_name AS department, roles.salary
FROM roles
LEFT JOIN department ON roles.department_id = department.id;
-- add a department

INSERT INTO department(department_name) VALUES(?);

-- view employee by department
SELECT employee.first_name, 
        employee.last_name, 
        department.department_name AS department
FROM employee 
LEFT JOIN roles ON employee.role_id = roles.id 
LEFT JOIN department ON roles.department_id = department.id;

--  view employee by manager
 SELECT 
        sub.id, 
    sub.first_name ,
    sub.last_name ,
    CONCAT(sup.first_name, " ", sup.last_name) AS manager
 FROM employee sub JOIN employee sup ON sub.manager_id = sup.id;

-- view salary by department

SELECT  department.id,
        department.department_name as department, 
        SUM(roles.salary) AS budget
FROM  roles
LEFT JOIN department on department.id = roles.department_id
GROUP BY department.id;
-- view employee by manager
SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Inner JOIN employee m ON e.manager_id = m.id;

-- test
SELECT employee.first_name, 
        employee.last_name, 
        department.department_name AS department
FROM employee 

LEFT JOIN roles ON employee.role_id = roles.id 
LEFT JOIN department ON roles.department_id = department.id
WHERE department_id=1;

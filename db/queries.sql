CREATE DATABASE school;
USE school;

CREATE TABLE parents(
id INT NOT NULL primary key auto_increment,
nameparent VARCHAR (50),
email VARCHAR (50),
password VARCHAR (50)

);

CREATE TABLE students(
id  INT NOT NULL primary key auto_increment,
class VARCHAR (30) not null,
name_student VARCHAR(50) not null,
lastname VARCHAR(50) not null,
date_of_birth DATE not null,
location VARCHAR (30) not null,
photo VARCHAR (100) not null,
report INT not null,
comments VARCHAR (500) not null,
fk_parent_id INT not null

);
USE school;

ALTER TABLE parents_users_db ADD address VARCHAR (20) AFTER email;

SELECT parents_users_db.nameparent, parents_users_db.email, parents_users_db.address, 
students.class, students.name_student, students.lastname, students.date_of_birth, students.location, students.photo, students.report,students.comments       
FROM parents_users_db INNER JOIN students ON parents_users_db.id = students.fk_parent_id;

SELECT parents_users_db.nameparent, parents_users_db.email, parents_users_db.address, 
students.class, students.name_student, students.lastname, students.date_of_birth, students.location, students.photo, students.report,students.comments       
FROM parents_users_db INNER JOIN students ON parents_users_db.id = students.fk_parent_id
WHERE parents_users_db.email = "nadinestrella@hotmail.com"


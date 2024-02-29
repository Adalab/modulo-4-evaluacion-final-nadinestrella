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

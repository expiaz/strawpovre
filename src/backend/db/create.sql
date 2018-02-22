-- User
CREATE USER 'strawpovre'@'localhost'
  IDENTIFIED BY 'Z-=37^3Jp';

-- Database
DROP DATABASE IF EXISTS strawpovre;
CREATE DATABASE strawpovre;
GRANT ALL PRIVILEGES ON strawpovre.* TO 'strawpovre'@'localhost';
-- Connect with mysql -u strawpovre -p if you want
USE strawpovre;

-- Tables
DROP TABLE IF EXISTS student;
CREATE TABLE student (
  `email`     VARCHAR(64)  NOT NULL,
  `name`      VARCHAR(100) NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`email`)
);
DROP TABLE IF EXISTS prof;
CREATE TABLE prof (
  `email`     VARCHAR(64)  NOT NULL,
  `password`  VARCHAR(64)  NOT NULL,
  `name`      VARCHAR(100) NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`email`)
);

-- INSERTS
INSERT INTO prof (email, password, name, firstname)
VALUES ('root@root.root', '63a9f0ea7bb98050796b649e85481845', 'root', 'admin');
INSERT INTO student (email, name, firstname) VALUES ('st1@st1.st1', 'John', 'Doe');
INSERT INTO student (email, name, firstname) VALUES ('st2@st2.st2', 'Doe', 'John');
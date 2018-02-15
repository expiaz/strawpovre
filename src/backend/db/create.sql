-- User
CREATE USER 'strawpovre'@'localhost' IDENTIFIED BY 'Z-=37^3Jp';

-- Database
DROP DATABASE IF EXISTS strawpovre;
CREATE DATABASE strawpovre;
GRANT ALL PRIVILEGES ON strawpovre.* TO 'strawpovre'@'localhost';
-- Connect with mysql -u strawpovre -p if you want
USE strawpovre;

-- Tables
DROP TABLE IF EXISTS student ;
CREATE TABLE student (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(100) NOT NULL,

  `name` VARCHAR(100) NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS prof;
CREATE TABLE prof (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(100) NOT NULL,

  `name` VARCHAR(100) NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

-- INSERTS
INSERT INTO prof (email, password, name, firstname) VALUES ('root@root.root', '63a9f0ea7bb98050796b649e85481845', 'root', 'admin');
INSERT INTO student (email, password, name, firstname) VALUES ('st1@st1.st1', '527bd5b5d689e2c32ae974c6229ff785', 'John', 'Doe');
INSERT INTO student (email, password, name, firstname) VALUES ('st2@st2.st2', '527bd5b5d689e2c32ae974c6229ff785', 'Doe', 'John');
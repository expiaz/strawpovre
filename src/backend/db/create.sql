-- User
DROP USER IF EXISTS 'strawpovre'@'localhost';
CREATE USER 'strawpovre'@'localhost'
  IDENTIFIED BY 'Z-=37^3Jp';

-- Database
DROP DATABASE IF EXISTS strawpovre;
CREATE DATABASE strawpovre;
GRANT ALL PRIVILEGES ON strawpovre.* TO 'strawpovre'@'localhost';
-- Connect
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

-- POLL
DROP TABLE IF EXISTS poll;
CREATE TABLE poll (
  `id`        VARCHAR(10)   NOT NULL,
  -- prof email
  `author`    VARCHAR(64)  NOT NULL,
  `password`  VARCHAR(64)  NOT NULL,
  `name`      VARCHAR(100) NOT NULL,
  `niveau`    VARCHAR(100) NOT NULL,

  FOREIGN KEY (`author`) REFERENCES `prof` (`email`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
);
-- QUESTION
DROP TABLE IF EXISTS question;
CREATE TABLE question (
  `id`        VARCHAR(10)   NOT NULL,
  -- poll id
  `poll_id`   VARCHAR(64)  NOT NULL,
  `question`  VARCHAR(300) NOT NULL,
  `level`     VARCHAR(100) NOT NULL,

  FOREIGN KEY (`poll_id`) REFERENCES `poll` (`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
);
-- ANSWER
DROP TABLE IF EXISTS answer;
CREATE TABLE answer (
  `id`        VARCHAR(10)   NOT NULL,
  -- question id
  `question_id`   VARCHAR(64)  NOT NULL,
  `answer`        VARCHAR(100) NOT NULL,
  `is_correct`    INT(2) NOT NULL,

  FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
);

-- INSERTS
INSERT INTO prof (email, password, name, firstname)
VALUES ('root@root.root', '63a9f0ea7bb98050796b649e85481845', 'root', 'admin');
INSERT INTO student (email, name, firstname) VALUES ('st1@st1.st1', 'John', 'Doe');
INSERT INTO student (email, name, firstname) VALUES ('st2@st2.st2', 'Doe', 'John');
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

-- LEVEL
DROP TABLE IF EXISTS level;
CREATE TABLE level (
  `id`    INT AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

-- SUBJECT
DROP TABLE IF EXISTS `subject`;
CREATE TABLE subject (
  `id`    INT AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

-- QUESTION
DROP TABLE IF EXISTS question;
CREATE TABLE question (
  `id`        INT AUTO_INCREMENT,
  `label`     VARCHAR(300) NOT NULL,
  `subject`   INT NOT NULL,
  `level`     INT NOT NULL,

  PRIMARY KEY (`id`),
  CONSTRAINT FK_questionSubject FOREIGN KEY (`subject`) REFERENCES `subject`(`id`)  ON DELETE CASCADE,
  CONSTRAINT FK_questionLevel FOREIGN KEY (`level`) REFERENCES `level`(`id`)  ON DELETE CASCADE
);

CREATE UNIQUE INDEX `IDX_label_subject_level` ON `question`(`label`, `level`, `subject`);

-- ANSWER
DROP TABLE IF EXISTS answer;
CREATE TABLE answer (
  `id`         INT AUTO_INCREMENT,
  `label`      VARCHAR(100) NOT NULL,
  `question`   INT NOT NULL,
  `correct`    BOOLEAN NOT NULL,

  PRIMARY KEY (`id`),
  CONSTRAINT FK_answerQuestion FOREIGN KEY (`question`) REFERENCES `question`(`id`) ON DELETE CASCADE
);

-- INSERTS
INSERT INTO prof (email, password, name, firstname)
VALUES ('root@root.root', '63a9f0ea7bb98050796b649e85481845', 'root', 'admin');
INSERT INTO student (email, name, firstname) VALUES ('st1@st1.st1', 'John', 'Doe');
INSERT INTO student (email, name, firstname) VALUES ('st2@st2.st2', 'Doe', 'John');

INSERT INTO subject VALUES (NULL, 'INFO1');
INSERT INTO subject VALUES (NULL, 'INFO2');
INSERT INTO subject VALUES (NULL, 'INFO3');
INSERT INTO subject VALUES (NULL, 'INFO4');
INSERT INTO subject VALUES (NULL, 'INFO5');
INSERT INTO level VALUES (NULL, 'L1');
INSERT INTO level VALUES (NULL, 'L2');
INSERT INTO level VALUES (NULL, 'L3');
INSERT INTO level VALUES (NULL, 'LP');
INSERT INTO level VALUES (NULL, 'M1');

INSERT INTO question VALUES (NULL, 'What is JWT ?', 2, 3);
INSERT INTO answer VALUES (NULL, 'JSON Web token', 1, TRUE);
INSERT INTO answer VALUES (NULL, 'Javascript waiting tick', 1, FALSE);
INSERT INTO answer VALUES (NULL, 'Just whip thomas', 1, FALSE);

INSERT INTO question VALUES (NULL, 'What is love ?', 1, 4);
INSERT INTO answer VALUES (NULL, 'Baby don t hurt me', 1, TRUE);
INSERT INTO answer VALUES (NULL, 'Baby don t hurt me, no more', 1, TRUE);
INSERT INTO answer VALUES (NULL, 'Rick rolled', 1, FALSE);
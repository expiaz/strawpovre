DROP TABLE `student` IF EXISTS;
CREATE TABLE `student` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(100) NOT NULL,

  `name` VARCHAR(100) NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

DROP TABLE `classe` IF EXISTS;
CREATE TABLE `classe` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

DROP TABLE `classe_student` IF EXISTS;
CREATE TABLE `classe_student` (
  `id` int(10) NOT NULL AUTO_INCREMENT,

  `student_id` int(10) NOT NULL,
  `classe_id` int(10) NOT NULL,

  FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`classe_id`) REFERENCES `classe` (`id`) ON DELETE CASCADE
);

DROP TABLE `prof` IF EXISTS;
CREATE TABLE `prof` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

DROP TABLE `course` IF EXISTS;
CREATE TABLE `course` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  `prof_id` int(10) NOT NULL,
  `classe_id` int(10) NOT NULL,

  FOREIGN KEY (`prof_id`) REFERENCES `prof` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`classe_id`) REFERENCES `classe` (`id`) ON DELETE CASCADE
);

DROP TABLE `subject` IF EXISTS;
CREATE TABLE `subject` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

DROP TABLE `level` IF EXISTS;
CREATE TABLE `level` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

DROP TABLE `poll` IF EXISTS;
CREATE TABLE `poll` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`)
);

DROP TABLE `course_poll` IF EXISTS;
CREATE TABLE `course_poll` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  `course_id` int(10) NOT NULL,
  `poll_id` int(10) NOT NULL,

  FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`poll_id`) REFERENCES `poll` (`id`) ON DELETE CASCADE

  PRIMARY KEY (`id`)
);



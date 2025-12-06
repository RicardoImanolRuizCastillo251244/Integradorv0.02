-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema TiendaUP
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema TiendaUP
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS TiendaUP DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE TiendaUP ;

-- -----------------------------------------------------
-- Table TiendaUP.ROL
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.ROL (
  id_rol TINYINT NOT NULL,
  descripcion VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_rol))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.USUARIO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.USUARIO (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  id_rol TINYINT NOT NULL,
  nombre_usuario VARCHAR(255) NOT NULL,
  correo_usuario VARCHAR(255) NOT NULL,
  contrasena VARBINARY(100) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT '1',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL,
  numero_cuenta VARCHAR(18) NULL DEFAULT NULL,
  titular_cuenta VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE INDEX correo_usuario (correo_usuario ASC) VISIBLE,
  INDEX id_rol (id_rol ASC) VISIBLE,
  CONSTRAINT USUARIO_ibfk_1
    FOREIGN KEY (id_rol)
    REFERENCES TiendaUP.ROL (id_rol))
ENGINE = InnoDB
AUTO_INCREMENT = 51
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.CATEGORIA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.CATEGORIA (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  tipo VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (id_categoria))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.PUBLICACION
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.PUBLICACION (
  id_publicacion INT NOT NULL AUTO_INCREMENT,
  titulo_publicacion VARCHAR(255) NOT NULL,
  descripcion_publicacion VARCHAR(2000) NOT NULL,
  foto_publicacion LONGBLOB NULL DEFAULT NULL,
  fecha_publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  estado_publicacion ENUM('ACTIVA', 'EXPIRADA', 'ELIMINADA') NOT NULL DEFAULT 'ACTIVA',
  id_vendedor INT NOT NULL,
  precio_producto DECIMAL(10,2) NOT NULL,
  id_categoria INT NULL DEFAULT NULL,
  existencia_publicacion INT NULL DEFAULT NULL,
  PRIMARY KEY (id_publicacion),
  INDEX id_vendedor (id_vendedor ASC) VISIBLE,
  INDEX id_categoria (id_categoria ASC) VISIBLE,
  CONSTRAINT PUBLICACION_ibfk_1
    FOREIGN KEY (id_vendedor)
    REFERENCES TiendaUP.USUARIO (id_usuario),
  CONSTRAINT PUBLICACION_ibfk_2
    FOREIGN KEY (id_categoria)
    REFERENCES TiendaUP.CATEGORIA (id_categoria))
ENGINE = InnoDB
AUTO_INCREMENT = 23
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.CALIFICACION
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.CALIFICACION (
  id_calificacion INT NOT NULL AUTO_INCREMENT,
  id_usuario_califica INT NOT NULL,
  id_publicacion INT NOT NULL,
  calificacion INT NOT NULL,
  experiencia TEXT NULL DEFAULT NULL,
  PRIMARY KEY (id_calificacion),
  INDEX id_usuario_califica (id_usuario_califica ASC) VISIBLE,
  INDEX id_publicacion (id_publicacion ASC) VISIBLE,
  CONSTRAINT CALIFICACION_ibfk_1
    FOREIGN KEY (id_usuario_califica)
    REFERENCES TiendaUP.USUARIO (id_usuario),
  CONSTRAINT CALIFICACION_ibfk_2
    FOREIGN KEY (id_publicacion)
    REFERENCES TiendaUP.PUBLICACION (id_publicacion))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.HORARIO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.HORARIO (
  id INT NOT NULL AUTO_INCREMENT,
  hora INT NULL DEFAULT NULL,
  PRIMARY KEY (id))
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.MEMBRESIA_TIPO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.MEMBRESIA_TIPO (
  id_membresia_tipo INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  nombre_membresia VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (id_membresia_tipo))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.NOTIFICACION
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.NOTIFICACION (
  id INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida TINYINT(1) NOT NULL DEFAULT '0',
  tipo VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  INDEX id_usuario (id_usuario ASC) VISIBLE,
  CONSTRAINT NOTIFICACION_ibfk_1
    FOREIGN KEY (id_usuario)
    REFERENCES TiendaUP.USUARIO (id_usuario))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.QUEJA_USUARIO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.QUEJA_USUARIO (
  id INT NOT NULL AUTO_INCREMENT,
  id_emisor INT NOT NULL,
  id_receptor INT NOT NULL,
  id_publicacion INT NULL DEFAULT NULL,
  descripcion_queja VARCHAR(1000) NOT NULL,
  fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_queja ENUM('ABIERTA', 'EN_PROCESO', 'CERRADA') NOT NULL DEFAULT 'ABIERTA',
  motivo_queja VARCHAR(255) NULL DEFAULT NULL,
  imagen LONGBLOB NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX id_emisor (id_emisor ASC) VISIBLE,
  INDEX id_receptor (id_receptor ASC) VISIBLE,
  INDEX QUEJA_USUARIO_ibfk_3 (id_publicacion ASC) VISIBLE,
  CONSTRAINT QUEJA_USUARIO_ibfk_1
    FOREIGN KEY (id_emisor)
    REFERENCES TiendaUP.USUARIO (id_usuario),
  CONSTRAINT QUEJA_USUARIO_ibfk_2
    FOREIGN KEY (id_receptor)
    REFERENCES TiendaUP.USUARIO (id_usuario),
  CONSTRAINT QUEJA_USUARIO_ibfk_3
    FOREIGN KEY (id_publicacion)
    REFERENCES TiendaUP.PUBLICACION (id_publicacion))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.VENTA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.VENTA (
  id INT NOT NULL AUTO_INCREMENT,
  id_publicacion INT NOT NULL,
  cantidad_vendida INT NOT NULL,
  fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  precio_total DECIMAL(10,2) NOT NULL,
  tipo_pago VARCHAR(50) NULL DEFAULT NULL,
  id_comprador INT NOT NULL,
  imagen LONGBLOB NULL DEFAULT NULL,
  hora_entrega TIME NULL DEFAULT NULL,
  fecha_entrega DATE NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX id_publicacion (id_publicacion ASC) VISIBLE,
  INDEX id_comprador (id_comprador ASC) VISIBLE,
  CONSTRAINT VENTA_ibfk_1
    FOREIGN KEY (id_publicacion)
    REFERENCES TiendaUP.PUBLICACION (id_publicacion),
  CONSTRAINT VENTA_ibfk_2
    FOREIGN KEY (id_comprador)
    REFERENCES TiendaUP.USUARIO (id_usuario))
ENGINE = InnoDB
AUTO_INCREMENT = 21
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.QUEJA_VENTA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.QUEJA_VENTA (
  id INT NOT NULL AUTO_INCREMENT,
  id_venta INT NOT NULL,
  id_emisor INT NOT NULL,
  descripcion_queja VARCHAR(1000) NOT NULL,
  fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_queja ENUM('ABIERTA', 'EN_PROCESO', 'CERRADA') NOT NULL DEFAULT 'ABIERTA',
  tipo_problema VARCHAR(255) NULL DEFAULT NULL,
  imagen LONGBLOB NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX id_venta (id_venta ASC) VISIBLE,
  INDEX id_emisor (id_emisor ASC) VISIBLE,
  CONSTRAINT QUEJA_VENTA_ibfk_1
    FOREIGN KEY (id_venta)
    REFERENCES TiendaUP.VENTA (id),
  CONSTRAINT QUEJA_VENTA_ibfk_2
    FOREIGN KEY (id_emisor)
    REFERENCES TiendaUP.USUARIO (id_usuario))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.USUARIO_BANEADO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.USUARIO_BANEADO (
  id_usuario INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (id_usuario),
  CONSTRAINT USUARIO_BANEADO_ibfk_1
    FOREIGN KEY (id_usuario)
    REFERENCES TiendaUP.USUARIO (id_usuario))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.USUARIO_MEMBRESIA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.USUARIO_MEMBRESIA (
  id_usuario_membresia INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_membresia_tipo INT NOT NULL,
  fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (id_usuario_membresia),
  INDEX id_usuario (id_usuario ASC) VISIBLE,
  INDEX id_membresia_tipo (id_membresia_tipo ASC) VISIBLE,
  CONSTRAINT USUARIO_MEMBRESIA_ibfk_1
    FOREIGN KEY (id_usuario)
    REFERENCES TiendaUP.USUARIO (id_usuario),
  CONSTRAINT USUARIO_MEMBRESIA_ibfk_2
    FOREIGN KEY (id_membresia_tipo)
    REFERENCES TiendaUP.MEMBRESIA_TIPO (id_membresia_tipo))
ENGINE = InnoDB
AUTO_INCREMENT = 21
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table TiendaUP.VENDEDOR_HORARIOS
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TiendaUP.VENDEDOR_HORARIOS (
  vendedor_id INT NOT NULL,
  horario_id INT NOT NULL,
  PRIMARY KEY (vendedor_id, horario_id),
  INDEX horario_id (horario_id ASC) VISIBLE,
  CONSTRAINT VENDEDOR_HORARIOS_ibfk_1
    FOREIGN KEY (vendedor_id)
    REFERENCES TiendaUP.USUARIO (id_usuario),
  CONSTRAINT VENDEDOR_HORARIOS_ibfk_2
    FOREIGN KEY (horario_id)
    REFERENCES TiendaUP.HORARIO (id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

USE TiendaUP;

DELIMITER $$
USE TiendaUP$$
CREATE
DEFINER=root@localhost
TRIGGER TiendaUP.trg_pub_set_expiration
BEFORE INSERT ON TiendaUP.PUBLICACION
FOR EACH ROW
BEGIN
  IF NEW.fecha_expiracion IS NULL THEN
    SET NEW.fecha_expiracion = DATE_ADD(NEW.fecha_publicacion, INTERVAL 24 HOUR);
  END IF;
END$$

USE TiendaUP$$
CREATE
DEFINER=root@localhost
TRIGGER TiendaUP.trg_um_set_expiration
BEFORE INSERT ON TiendaUP.USUARIO_MEMBRESIA
FOR EACH ROW
BEGIN
  IF NEW.fecha_expiracion IS NULL THEN
    SET NEW.fecha_expiracion = DATE_ADD(NEW.fecha_inicio, INTERVAL 30 DAY);
  END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
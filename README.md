# Mediflow - Sistema de Gestion Medica

## Descripcion General
Mediflow es una solucion de software desarrollada para optimizar la administracion y operacion dentro de entornos medicos. El sistema centraliza el manejo de informacion de pacientes, el control de inventarios de suministros y la gestion de autenticacion de usuarios, proporcionando una interfaz moderna y eficiente para el personal administrativo y sanitario.

## Arquitectura del Proyecto
El repositorio esta estructurado bajo un esquema monorepo que separa claramente la capa de interfaz de usuario del servidor y la logica de base de datos:
- `frontend`: Contiene la aplicacion web desarrollada en Angular bajo una arquitectura de componentes independientes (Standalone Components), optimizada con animaciones CSS nativas para asegurar un rendimiento fluido y evitar parpadeos visuales durante la navegacion.
- `backend`: Contiene la logica del servidor, la conexion con la base de datos y los servicios de API necesarios para procesar las peticiones del sistema.

## Tecnologias y Herramientas Utilizadas
- **Frontend**: Angular, TypeScript, CSS Nativo.
- **Backend y Base de Datos**: Node.js, Prisma ORM para la gestion y migracion de esquemas de base de datos.
- **Gestor de Paquetes**: pnpm para la instalacion eficiente de dependencias tanto en el frontend como en el backend.
- **Control de Versiones**: Git y GitHub, utilizando una estrategia de ramas estructurada (`main`, `develop`, `test` y `jflores-2022373`).

## Estrategia de Ramas en el Repositorio
- `main`: Rama principal de produccion que contiene el codigo estable y listo para despliegue.
- `develop`: Rama de integracion continua donde se unifican las caracteristicas antes de pasar a fases avanzadas.
- `test`: Rama destinada a pruebas generales y validacion unificada de los cambios provenientes de `main` y `develop`.
- `jflores-2022373`: Rama de trabajo individual asignada para el registro y desarrollo de avances del usuario.

## Requisitos Previos
Antes de iniciar la ejecucion local, asegurate de tener instalado en tu equipo:
- Node.js (versión LTS recomendada)
- pnpm (gestor de paquetes principal del proyecto)
- Git

## Guia de Instalacion y Ejecucion Local

Sigue estos pasos en tu terminal para configurar y poner en marcha el proyecto completo:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/jflores-2022373/mediflow-system.git](https://github.com/jflores-2022373/mediflow-system.git)
cd mediflow-system

2. Configuracion y Ejecucion del Backend

Dirigete a la carpeta del backend, instala las dependencias, genera el cliente de Prisma y levanta el servidor:
Bash

cd backend
pnpm install
pnpm prisma generate
pnpm start

(Nota: Si utilizas un script de desarrollo continuo en el backend, puedes ejecutar pnpm run dev segun tu configuracion).
3. Configuracion y Ejecucion del Frontend

Abre una nueva pestaña o ventana en tu terminal, dirigete a la carpeta del frontend, instala las dependencias e inicia la aplicacion:
Bash

cd frontend
pnpm install
pnpm start

4. Acceso a la Aplicacion

Una vez que ambos servicios esten activos, abre tu navegador web e ingresa a la siguiente direccion:
Plaintext

http://localhost:4200

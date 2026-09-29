# Mediflow - Sistema de Gestion Medica

## Descripcion General
Mediflow es una aplicacion web disenada para la gestion y administracion de servicios medicos. Permite el control eficiente de pacientes, inventarios y el acceso seguro al sistema mediante autenticacion de usuarios por correo electronico y servicios externos de autenticacion.

## Caracteristicas Principales
- Interfaz de usuario desarrollada en Angular con componentes independientes (Standalone Components).
- Diseno optimizado utilizando animaciones CSS nativas para un rendimiento fluido y evitar parpadeos visuales.
- Sistema de autenticacion con soporte para inicio de sesion mediante correo y contrasena, asi como autenticacion con Google.
- Gestion de pacientes y control de inventario medico integrados.
- Enrutamiento eficiente y manejo de estado sincronizado con el ciclo de vida de la aplicacion.

## Tecnologias Utilizadas
- **Frontend**: Angular, TypeScript, CSS Nativo.
- **Control de Versiones**: Git y GitHub (gestionado bajo ramas especificas: main, develop, test y jflores-2022373).

## Estructura de Ramas en el Repositorio
- `main`: Rama principal de produccion con el codigo estable.
- `develop`: Rama de integracion para el desarrollo continuo de caracteristicas.
- `test`: Rama destinada a pruebas y unificacion de codigo previo a produccion.
- `jflores-2022373`: Rama de trabajo individual para el registro de avances.

## Instalacion y Ejecucion Local

Sigue estos pasos en tu terminal para clonar y ejecutar el proyecto utilizando **pnpm**:

1. Clona el repositorio:
```bash
git clone [https://github.com/jflores-2022373/mediflow-system.git](https://github.com/jflores-2022373/mediflow-system.git)

    Entra al directorio del proyecto:

Bash

cd mediflow-system

    Dirigete a la carpeta del frontend e instala las dependencias con pnpm:

Bash

cd frontend
pnpm install

    Ejecuta la aplicacion en modo de desarrollo:

Bash

pnpm start

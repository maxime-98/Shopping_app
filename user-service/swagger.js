// user-service/swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Service API",
      version: "1.0.0",
      description: "Gestion des utilisateurs et authentification"
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'User Service',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./routes/*.js"]
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs
};

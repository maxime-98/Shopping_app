const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "List Service - Shopping App API",
      version: "1.0.0",
      description: "Documentation du microservice des listes de courses",
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'List Service',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Chemin des fichiers avec les commentaires Swagger
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs,
};

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shopping App API",
      version: "1.0.0",
      description: "Documentation des microservices de l'application",
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Product Service',
      },
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
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./routes/*.js"], // Toutes les routes documentées ici
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs,
};

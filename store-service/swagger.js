const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Store Service - Shopping App API",
      version: "1.0.0",
      description: "Documentation du microservice des magasins",
    },
    servers: [
      {
        url: 'http://localhost:3005',
        description: 'Store Service',
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
  apis: ["./routes/*.js"], // 📍 Toutes les routes du dossier routes
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs,
};

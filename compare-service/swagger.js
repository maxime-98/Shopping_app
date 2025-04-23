// swagger.js (à mettre à la racine de compare-service)
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Compare Service API',
      version: '1.0.0',
      description: 'Service de comparaison de listes de courses'
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Compare Service',
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

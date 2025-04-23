const axios = require('axios');

const services = [
  { name: 'Product Service', url: 'http://product-service:3000/swagger.json' },
  { name: 'List Service', url: 'http://list-service:3001/swagger.json' },
  { name: 'User Service', url: 'http://user-service:3003/swagger.json' },
  { name: 'Store Service', url: 'http://store-service:3005/swagger.json' },
  { name: 'Compare Service', url: 'http://compare-service:3002/swagger.json' }
];

module.exports = async function loadAndMerge() {
  const merged = {
    openapi: '3.0.0',
    info: {
      title: 'Shopping App – Documentation Globale',
      version: '1.0.0'
    },
    paths: {},
    components: {}
  };

  for (const service of services) {
    try {
      const res = await axios.get(service.url);
      Object.assign(merged.paths, res.data.paths);
      if (res.data.components) {
        merged.components = {
          ...merged.components,
          ...res.data.components
        };
      }
    } catch (err) {
      console.error(`❌ Impossible de charger ${service.url}`);
    }
  }

  return merged;
};

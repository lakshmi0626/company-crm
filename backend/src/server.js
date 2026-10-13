const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`CRM API listening on port ${env.port}`);
});

const convict = require('convict');

const schema = {
  port: {
    doc: 'HTTP port',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  nodeEnv: {
    doc: 'Node environment',
    format: ['prod', 'dev', 'test'],
    default: 'dev',
    env: 'NODE_ENV'
  }
};

const config = convict(schema);
config.validate({ allowed: 'strict' });
module.exports = config.getProperties();
module.exports = {
  type: 'postgres',
  host: require('./config.json').db.host,
  port: require('./config.json').db.port,
  username: require('./config.json').db.username,
  password: require('./config.json').db.password,
  database: 'dtmodlog',
  synchronize: true,
  logging: false,
  entities: [process.env.NODE_ENV == 'production' ? 'build/src/entity/**/*.js' : 'src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};

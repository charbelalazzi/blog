module.exports = {
  mongo: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
  },
  app: {
    port: process.env.APP_PORT,
    secret: process.env.APP_SECRET
  },
};

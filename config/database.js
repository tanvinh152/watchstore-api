module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        client: "mysql",
        host: env("DATABASE_HOST", "127.0.0.1"),
        port: env.int("DATABASE_PORT", 3306),
        database: env("DATABASE_NAME", "store"),
        user: env("DATABASE_USERNAME", "root"),
        password: env("DATABASE_PASSWORD", "150299"),
        //add this line
        ssl: {
          rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false), // For self-signed certificates
        },
      },
      // add this line
      options: {
        ssl: env.bool("DATABASE_SSL", false),
      },
    },
  },
});

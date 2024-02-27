module.exports = {
  apps: [
    {
      name: 'next-bruss',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      //   interpreter: 'bun',
      env: {
        PORT: 81,
        NODE_ENV: 'production',
      },
    },
  ],
};

module.exports = {
  apps: [
    {
      name: 'doc-vortex',
      script: './server/index.ts',
      interpreter: 'node',
      node_args: `--import=data:text/javascript,import%20{%20register%20}%20from%20'node:module';%20import%20{%20pathToFileURL%20}%20from%20'node:url';%20register('ts-node/esm',%20pathToFileURL('./'));`,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};


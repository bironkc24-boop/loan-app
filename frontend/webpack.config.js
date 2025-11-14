const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Configure for Replit proxy environment
  if (config.devServer) {
    config.devServer.allowedHosts = 'all';
  } else {
    config.devServer = {
      allowedHosts: 'all'
    };
  }
  
  return config;
};

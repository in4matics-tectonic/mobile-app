// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const { createApiProxy } = require('./scripts/dev-api-proxy');

const config = getDefaultConfig(__dirname);

// Dev server only: proxy /v1 to the KBC Momentum backend and /kate-chat to the Kate chat,
// same as nginx in the deployed PoC. See scripts/dev-api-proxy.js.
const apiProxy = createApiProxy();
const enhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const metroMiddleware = enhanceMiddleware ? enhanceMiddleware(middleware, server) : middleware;
  return (req, res, next) => apiProxy(req, res, () => metroMiddleware(req, res, next));
};

module.exports = config;

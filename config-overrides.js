// @ts-nocheck
const { override } = require("customize-cra");
const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

const cspConfigPolicy = {
  "default-src": "'self' 'unsafe-inline'",
};

function addCspHtmlWebpackPlugin(config) {
  config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy));

  return config;
}

module.exports = {
  webpack: override(addCspHtmlWebpackPlugin),
};

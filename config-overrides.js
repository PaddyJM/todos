// @ts-nocheck
const webpack = require("webpack");
module.exports = {
  webpack: function (config, env) {
    config.resolve.fallback = {
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      "process/browser": require.resolve("process/browser"),
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      })
    );
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser.js",
      })
    );
    return config;
  },
};

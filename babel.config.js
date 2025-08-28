// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      // NOTE: Reanimated plugin must be listed last
      ["react-native-reanimated/plugin"],
    ],
  };
};
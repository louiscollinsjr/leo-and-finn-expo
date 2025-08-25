// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      // NOTE: Worklets plugin (Reanimated v3+) must be listed last
      ["react-native-worklets/plugin", {}, "worklets"],
    ],
  };
};
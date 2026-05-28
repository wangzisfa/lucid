const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro config. Exclude the standalone Next.js backend in ./server so Metro
 * doesn't try to bundle it.
 * https://reactnative.dev/docs/metro
 */
const config = {
  resolver: {
    blockList: [/[/\\]server[/\\].*/],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

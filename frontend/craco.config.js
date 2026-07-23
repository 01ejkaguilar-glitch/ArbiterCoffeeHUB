const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Only override build output directory in production
      if (env.NODE_ENV === 'production') {
        paths.appBuild = path.resolve(__dirname, '../build');
        webpackConfig.output.path = path.resolve(__dirname, '../build');
      }

      // Add webpack aliases from jsconfig.json
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          '@': path.resolve(__dirname, 'src'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@components/shared': path.resolve(__dirname, 'src/components/shared'),
          '@components/responsive': path.resolve(__dirname, 'src/components/responsive'),
          '@pages': path.resolve(__dirname, 'src/pages'),
          '@pages/admin': path.resolve(__dirname, 'src/pages/admin'),
          '@styles': path.resolve(__dirname, 'src/styles'),
          '@utils': path.resolve(__dirname, 'src/utils'),
          '@services': path.resolve(__dirname, 'src/services'),
          '@hooks': path.resolve(__dirname, 'src/hooks'),
          '@contexts': path.resolve(__dirname, 'src/contexts'),
          '@assets': path.resolve(__dirname, 'src/assets'),
        },
        extensions: [...(webpackConfig.resolve.extensions || []), '.js', '.jsx', '.json'],
      };

      return webpackConfig;
    },
  },
};
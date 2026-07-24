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
  jest: {
    configure: (jestConfig) => {
      return {
        ...jestConfig,
        moduleNameMapper: {
          '^@/(.*)$': '<rootDir>/src/$1',
          '^@$': '<rootDir>/src',
          '^@components/(.*)$': '<rootDir>/src/components/$1',
          '^@components$': '<rootDir>/src/components',
          '^@components/shared/(.*)$': '<rootDir>/src/components/shared/$1',
          '^@components/shared$': '<rootDir>/src/components/shared',
          '^@components/responsive/(.*)$': '<rootDir>/src/components/responsive/$1',
          '^@components/responsive$': '<rootDir>/src/components/responsive',
          '^@pages/(.*)$': '<rootDir>/src/pages/$1',
          '^@pages$': '<rootDir>/src/pages',
          '^@pages/admin/(.*)$': '<rootDir>/src/pages/admin/$1',
          '^@pages/admin$': '<rootDir>/src/pages/admin',
          '^@styles/(.*)$': '<rootDir>/src/styles/$1',
          '^@styles$': '<rootDir>/src/styles',
          '^@utils/(.*)$': '<rootDir>/src/utils/$1',
          '^@utils$': '<rootDir>/src/utils',
          '^@services/(.*)$': '<rootDir>/src/services/$1',
          '^@services$': '<rootDir>/src/services',
          '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
          '^@hooks$': '<rootDir>/src/hooks',
          '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
          '^@contexts$': '<rootDir>/src/contexts',
          '^@assets/(.*)$': '<rootDir>/src/assets/$1',
          '^@assets$': '<rootDir>/src/assets',
        },
      };
    },
  },
};
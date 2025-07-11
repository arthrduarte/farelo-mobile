const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PROD = process.env.APP_VARIANT === 'production';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.arthrduarte.farelo.dev';
  }

  if (IS_PROD) {
    return 'com.arthrduarte.farelo';
  }

  return 'com.arthrduarte.farelo';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Farelo (Dev)';
  }

  if (IS_PROD) {
    return 'Farelo';
  }

  return 'Farelo';
};


export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});


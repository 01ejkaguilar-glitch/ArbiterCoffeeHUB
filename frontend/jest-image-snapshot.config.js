const path = require('path');

module.exports = {
  stem: 1, // don't crop the images
  failureThreshold: 0.03, // 3% of pixels can be different before failing
  failureThresholdType: 'percent', // threshold type is percent of total pixels
  customDiffConfig: { threshold: 0.1 }, // sensitivity for detecting differences
  capture: 'selector',
  customSnapshotsDir: path.resolve(__dirname, '__image_snapshots__'),
  customDiffDir: path.resolve(__dirname, '__image_diff__'),
};
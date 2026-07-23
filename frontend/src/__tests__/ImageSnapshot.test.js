import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from '@storybook/addon-storyshots-puppeteer';

initStoryshots({
  framework: 'react',
  test: imageSnapshot({
    // Optional: customize the image snapshot behavior
    // For example, you can set the viewport, etc.
    // See: https://github.com/storybookjs/storybook/tree/next/code/addons/storyshots#frameworks
  }),
});
const fs = require('fs');
const path = require('path');

describe('Design System Tokens', () => {
  const designSystemPath = path.resolve(__dirname, 'design-system.css');
  let designSystemContent = '';

  beforeAll(() => {
    designSystemContent = fs.readFileSync(designSystemPath, 'utf8');
  });

  test('contains mobile spacing tokens', () => {
    const mobileSpacingTokens = [
      '--spacing-mobile-0:',
      '--spacing-mobile-1:',
      '--spacing-mobile-2:',
      '--spacing-mobile-3:',
      '--spacing-mobile-4:',
      '--spacing-mobile-5:',
      '--spacing-mobile-6:',
      '--spacing-mobile-8:',
      '--spacing-mobile-10:',
      '--spacing-mobile-12:',
      '--spacing-mobile-16:'
    ];

    mobileSpacingTokens.forEach(token => {
      expect(designSystemContent).toContain(token);
    });
  });

  test('contains mobile typography tokens', () => {
    const mobileTypographyTokens = [
      '--font-size-mobile-base:',
      '--font-size-mobile-sm:',
      '--font-size-mobile-lg:'
    ];

    mobileTypographyTokens.forEach(token => {
      expect(designSystemContent).toContain(token);
    });
  });

  test('contains mobile border radius tokens', () => {
    const mobileRadiusTokens = [
      '--radius-mobile-sm:',
      '--radius-mobile-md:',
      '--radius-mobile-lg:'
    ];

    mobileRadiusTokens.forEach(token => {
      expect(designSystemContent).toContain(token);
    });
  });

  test('contains mobile shadow tokens', () => {
    const mobileShadowTokens = [
      '--shadow-mobile-sm:',
      '--shadow-mobile-md:',
      '--shadow-mobile-lg:'
    ];

    mobileShadowTokens.forEach(token => {
      expect(designSystemContent).toContain(token);
    });
  });

  test('contains mobile transition token', () => {
    expect(designSystemContent).toContain('--transition-mobile-base:');
  });

  test('contains breakpoint tokens', () => {
    const breakpointTokens = [
      '--bp-mobile:',
      '--bp-tablet:',
      '--bp-desktop:',
      '--bp-wide:'
    ];

    breakpointTokens.forEach(token => {
      expect(designSystemContent).toContain(token);
    });
  });
});
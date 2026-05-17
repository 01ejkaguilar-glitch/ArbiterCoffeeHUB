const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: [
    './frontend/src/**/*.js',
    './frontend/src/**/*.jsx',
    './frontend/src/**/*.ts',
    './frontend/src/**/*.tsx',
    './frontend/public/index.html',
    // Add any other paths to your template files here
  ],

  // This is the function used to extract class names from your templates
  defaultExtractor: (content) => {
    // Capture as liberally as possible, including things like `h-(screen-1.5)`
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
    // Capture classes within `class: ` expressions (for Vue)
    const classMatches = content.match(/class:[^<>"'`\s]*[^<>"'`\s:]/g) || []
    return broadMatches.concat(classMatches)
  },
})

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    // Add purgecss in production only
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
}
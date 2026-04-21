// Vercel Serverless Entry Point
// Imports from pre-compiled dist/ where all @/src/* path aliases are already resolved by tsc-alias
const app = require('../dist/src/frameworks/express/server').default;
module.exports = app;

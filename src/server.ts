if (!process.env['VERCEL']) {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

// Connect middleware to ensure DB is initialized
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err);
    next(err);
  }
});

// Run initial connect
connectDB().catch(console.error);

if (!process.env['VERCEL']) {
  app.listen(env.PORT, () => {
    console.log('===============================================');
    console.log(' Wadaq Store API Server is running!');
    console.log(` URL: http://localhost:${env.PORT}`);
    console.log(` Health: http://localhost:${env.PORT}/api/health`);
    console.log(` Environment: ${env.NODE_ENV}`);
    console.log(` Client URL: ${env.CLIENT_URL}`);
    console.log('===============================================');
  });
}

// Support CommonJS handler for @vercel/node and ES Module
module.exports = app;
module.exports.default = app;
export default app;

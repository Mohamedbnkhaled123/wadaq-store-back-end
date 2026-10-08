import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
﻿import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function startServer() {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`===============================================`);
      console.log(` Wadaq Store API Server is running!`);
      console.log(` URL: http://localhost:${env.PORT}`);
      console.log(` Health: http://localhost:${env.PORT}/api/health`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(` Client URL: ${env.CLIENT_URL}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

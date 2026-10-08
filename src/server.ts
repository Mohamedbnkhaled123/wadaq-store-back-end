import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

// Ensure DB connection is initiated
connectDB();

if (!process.env['VERCEL']) {
  app.listen(env.PORT, () => {
    console.log(===============================================);
    console.log( Wadaq Store API Server is running!);
    console.log( URL: http://localhost:);
    console.log( Health: http://localhost:/api/health);
    console.log( Environment: );
    console.log( Client URL: );
    console.log(===============================================);
  });
}

export default app;

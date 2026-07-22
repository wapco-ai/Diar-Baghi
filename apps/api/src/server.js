import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import { checkDatabaseConnection, pool } from './db.js';
import { surveyRoutes } from './routes/surveys.js';
import { responseRoutes } from './routes/responses.js';

dotenv.config();

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

await app.register(surveyRoutes, {
  pool,
});

await app.register(responseRoutes, {
  pool,
});

app.get('/health', async (request, reply) => {
  try {
    const database = await checkDatabaseConnection();

    return {
      status: 'ok',
      service: 'diar-baghi-api',
      database: {
        status: 'connected',
        time: database.database_time,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    request.log.error(error);

    return reply.status(503).send({
      status: 'error',
      service: 'diar-baghi-api',
      database: {
        status: 'disconnected',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? 3000);

const shutdown = async (signal) => {
  app.log.info({ signal }, 'Shutting down API');

  try {
    await app.close();
    await pool.end();
    process.exit(0);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

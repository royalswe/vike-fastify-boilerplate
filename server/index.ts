import Fastify from 'fastify';
import middie from '@fastify/middie';
import { renderPage } from 'vike/server';
import { root } from './root.js';

const isProduction = process.env.NODE_ENV === 'production';

const development = {
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  https: {
    key: (await import('fs')).readFileSync('cert/dev.pem'),
    cert: (await import('fs')).readFileSync('cert/cert.pem'),
  },
};

const production = {
  logger: false
};

buildServer();

async function buildServer() {
  const app = Fastify(
    isProduction ? production : development
  );

  await app.register(import('@fastify/compress'), { global: true });

  // Vite integration
  if (isProduction) {
    // In production, we need to serve our static assets ourselves.
    // (In dev, Vite's middleware serves our static assets.)
    await app.register(import('@fastify/static'), {
      root: root + '/dist/client/assets',
      prefix: '/assets/',
    });
  } else {
    // We instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We instantiate it only in development. (It isn't needed in production and it
    // would unnecessarily bloat our production server.)
    await app.register(middie);

    const vite = await import('vite');
    const viteDevMiddleware = (
      await vite.createServer({
        server: {
          middlewareMode: true,
        },
      })
    ).middlewares;
    await app.use(viteDevMiddleware);
  }

  app.get('*', async (request, reply) => {
    const pageContextInit = {
      urlOriginal: request.raw.url || ''
    };
    const pageContext = await renderPage(pageContextInit);
    const { httpResponse } = pageContext;
    if (!httpResponse) {
      reply.callNotFound();
      return;
    } else {
      const { statusCode, headers } = httpResponse;
      reply.status(statusCode);
      headers.forEach(([name, value]) => reply.header(name, value));      
      httpResponse.pipe(reply.raw);
    }
  });

  return app;
}

async function main() {
  const fastify = await buildServer();

  const port = process.env.PORT || 3000;
  fastify.listen({ port: +port }, function (err) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}

main();
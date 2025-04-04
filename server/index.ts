import Fastify from 'fastify';
import { renderPage } from 'vike/server';
import { root } from './root.js';

const isProduction = process.env.NODE_ENV === 'production';

const development = {
  logger:
  {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  http2: true,
  https: {
    key: (await import('fs')).readFileSync('cert/dev.pem'),
    cert: (await import('fs')).readFileSync('cert/cert.pem'),
  },
};

const production = {
  logger: false
};

async function buildServer() {
  const app = Fastify(
    isProduction ? production : development
  );

  await app.register(import('@fastify/compress'), { global: true });

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
    const { createDevMiddleware } = await import('vike/server');
    const { devMiddleware } = await createDevMiddleware();

    // this is middleware for vite's dev servert
    app.addHook('onRequest', async (request, reply) => {
      const next = () => new Promise<void>((resolve) => {
        devMiddleware(request.raw, reply.raw, resolve);
      });
      await next();
    });
  }

  app.get('*', async (request, reply) => {
    const pageContextInit = {
      urlOriginal: request.raw.url || ''
    };
    const pageContext = await renderPage(pageContextInit);
    const { statusCode, headers, getReadableNodeStream } =
      pageContext.httpResponse;

    headers.forEach(([name, value]: [string, string]) =>
      reply.header(name, value)
    );
    reply.status(statusCode).send(await getReadableNodeStream());

    return reply;

  });

  return app;
}

async function main() {
  const fastify = await buildServer();

  const port = process.env.PORT || 3000;
  fastify.listen({ port: +port }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

main();
// This file isn't processed by Vite, see https://github.com/vikejs/vike/issues/562
// Consequently:
//  - When changing this file, you needed to manually restart your server for your changes to take effect.
//  - To use your environment variables defined in your .env files, you need to install dotenv, see https://vike.dev/env
//  - To use your path aliases defined in your vite.config.js, you need to tell Node.js about them, see https://vike.dev/path-aliases

// If you want Vite to process your server code then use one of these:
//  - vavite (https://github.com/cyco130/vavite)
//     - See vavite + Vike examples at https://github.com/cyco130/vavite/tree/main/examples
//  - vite-node (https://github.com/antfu/vite-node)
//  - HatTip (https://github.com/hattipjs/hattip)
//    - You can use Bati (https://batijs.github.io/) to scaffold a Vike + HatTip app. Note that Bati generates apps that use the V1 design (https://vike.dev/migration/v1-design) and Vike packages (https://vike.dev/vike-packages)

import Fastify from 'fastify';
import middie from '@fastify/middie';
import { renderPage } from 'vike/server'
import { root } from './root.js';

const isProduction = process.env.NODE_ENV === 'production'

startServer()

async function startServer() {
  const app = Fastify({
    logger: false,
    ...(!isProduction ? {
      https: {
        key: (await import('fs')).readFileSync('cert/dev.pem'),
        cert: (await import('fs')).readFileSync('cert/cert.pem'),
      },
    } : {}),
  }); // fastify makes routes and middleware easier to work with
  await app.register(import('@fastify/compress'), { global: true });

  // Vite integration
  if (isProduction) {
    // In production, we need to serve our static assets ourselves.
    // (In dev, Vite's middleware serves our static assets.)
    await app.register(import('@fastify/static'), {
      root: root + './dist/client',
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

  // ...
  // Other middlewares (e.g. some RPC middleware such as Telefunc)
  // ...

  // Vike middleware. It should always be our last middleware (because it's a
  // catch-all middleware superseding any middleware placed after it).

  app.all('/*', async (request, reply) => {
    const pageContextInit = {
      urlOriginal: request.raw.url || ''
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) {
      reply.callNotFound()
      return
    } else {
      const { statusCode, headers } = httpResponse
      reply.status(statusCode)
      headers.forEach(([name, value]) => reply.header(name, value))
  
      httpResponse.pipe(reply.raw);
    }
  });
  

  const port = process.env.PORT || 4000
  app.listen({ port: +port }, function(err, address) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    
    console.log(` 🎉 Server running at ${address}`);
  });
}

import serverlessExpress from '@codegenie/serverless-express';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { BookingService } from './modules/booking/booking.service';

let cachedServer: ReturnType<typeof serverlessExpress>;

async function bootstrapServer(): Promise<ReturnType<typeof serverlessExpress>> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    rawBody: true,
  });
  configureApp(app);
  await app.init();
  return serverlessExpress({ app: expressApp });
}

// Main HTTP handler — proxies every request through the Nest app (see serverless.yml `functions.api`).
// Promise-style handler only (event, context) — Node.js 24's Lambda runtime removed support for
// callback-based handlers (3-arg signature), see UPGRADE.md in @codegenie/serverless-express v5.
export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> => {
  context.callbackWaitsForEmptyEventLoop = false;
  cachedServer ??= await bootstrapServer();
  // The 3rd (callback) param below only satisfies the library's typed signature — resolutionMode
  // defaults to 'PROMISE', so it's never actually invoked; this function's real return value is
  // the resolved promise, which is what our own 2-arg exported `handler` returns to Lambda.
  return (await cachedServer(event, context, () => {})) as APIGatewayProxyResultV2;
};

// Scheduled handler — EventBridge invokes this every minute (see serverless.yml
// `functions.expireSeatLocks`). The in-process @Cron in BookingService only fires while a
// container stays warm between invocations, which Lambda never guarantees, so seat-lock
// expiry needs its own externally-triggered function in this deployment target.
export const expireSeatLocksHandler = async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    await app.get(BookingService).releaseExpiredLocks();
  } finally {
    await app.close();
  }
};

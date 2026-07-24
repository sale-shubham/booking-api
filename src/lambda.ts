import serverlessExpress from '@codegenie/serverless-express';
import type { Callback, Context, Handler } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { BookingService } from './modules/booking/booking.service';

let cachedServer: Handler;

async function bootstrapServer(): Promise<Handler> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    rawBody: true,
  });
  configureApp(app);
  await app.init();
  return serverlessExpress({ app: expressApp });
}

// Main HTTP handler — proxies every request through the Nest app (see serverless.yml `functions.api`).
export const handler: Handler = async (event, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  cachedServer ??= await bootstrapServer();
  return cachedServer(event, context, callback);
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

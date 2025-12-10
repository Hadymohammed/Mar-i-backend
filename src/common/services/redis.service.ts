import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST ,
        port: parseInt(process.env.REDIS_PORT)
      },
      database: parseInt(process.env.REDIS_DB) ,
      password: process.env.REDIS_PASS
    });
  }

  async onModuleInit() {
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
  
  getClient() {
    return this.client;
  }
}

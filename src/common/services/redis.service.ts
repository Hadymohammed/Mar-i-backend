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

  async set(key: string, value: string, expiresInSeconds?: number): Promise<void> {
    if (expiresInSeconds) {
      await this.client.SET(key, value, {
        EX: expiresInSeconds,
      });
    } else {
      await this.client.SET(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return (await this.client.GET(key)) as string | null;
  }

  async del(key: string): Promise<number> {
    return (await this.client.DEL(key)) as number;
  }
}

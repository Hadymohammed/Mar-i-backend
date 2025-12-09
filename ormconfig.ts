import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  migrations: ['./src/migrations/*{.ts,.js}'],
  entities: ['./src/**/*.entity{.ts,.js}'],
};

const dataSource = new DataSource(dataSourceOptions);
dataSource.initialize();

export default dataSource;

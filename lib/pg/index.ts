import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: '10.24.10.102',
  database: 'm413',
  password: 'postgres',
  port: 5432,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

import Firebird from 'node-firebird';
import dotenv from 'dotenv';

dotenv.config();

interface ConnectionPool {
  connections: Firebird.Database[];
  available: Firebird.Database[];
  waitQueue: ((db: Firebird.Database) => void)[];
}

const pool: ConnectionPool = {
  connections: [],
  available: [],
  waitQueue: [],
};

const options: Firebird.Options = {
  host: process.env.FIREBIRD_HOST || '127.0.0.1',
  port: parseInt(process.env.FIREBIRD_PORT || '3050'),
  database: process.env.FIREBIRD_DATABASE || 'E:\\Code Virtu\\104168380001148\\BaseLine\\BANK.FDB',
  user: process.env.FIREBIRD_USER || 'SYSDBA',
  password: process.env.FIREBIRD_PASSWORD || 'masterkey',
  lowercase_keys: false,
  role: undefined,
  pageSize: 4096,
};

const POOL_SIZE = parseInt(process.env.FIREBIRD_POOL_SIZE || '5');

/**
 * Inicializa o pool de conexões
 */
export async function initializePool(): Promise<void> {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < POOL_SIZE; i++) {
      Firebird.attach(options, (err, db) => {
        if (err) return reject(err);
        pool.connections.push(db);
        pool.available.push(db);
        if (pool.connections.length === POOL_SIZE) {
          resolve();
        }
      });
    }
  });
}

/**
 * Obtém uma conexão do pool
 */
export function getConnection(callback: (err: Error | null, db?: Firebird.Database) => void) {
  if (pool.available.length > 0) {
    const db = pool.available.pop();
    callback(null, db);
  } else {
    pool.waitQueue.push((db) => callback(null, db));
  }
}

/**
 * Devolve uma conexão ao pool
 */
export function releaseConnection(db: Firebird.Database) {
  if (pool.waitQueue.length > 0) {
    const callback = pool.waitQueue.shift();
    callback?.(db);
  } else {
    pool.available.push(db);
  }
}

/**
 * Fecha todas as conexões do pool
 */
export async function closePool(): Promise<void> {
  return new Promise((resolve, reject) => {
    let closedCount = 0;
    pool.connections.forEach((db) => {
      db.detach((err) => {
        if (err) return reject(err);
        closedCount++;
        if (closedCount === pool.connections.length) {
          pool.connections = [];
          pool.available = [];
          resolve();
        }
      });
    });
  });
}

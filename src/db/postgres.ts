import { Kysely, PostgresDialect, ColumnType, Generated } from 'kysely';
import { Pool } from 'pg';
import logger from '../utils/logger';

type DateColumn = ColumnType<string, string | Date, string | Date>;
type NullableDateColumn = ColumnType<string | null, string | Date | null, string | Date | null>;
type TimestampColumn = ColumnType<Date, Date | string, Date | string>;
type NullableTimestampColumn = ColumnType<Date | null, Date | string | null, Date | string | null>;
type NumericColumn = ColumnType<string, string | number, string | number>;
type NullableNumericColumn = ColumnType<string | null, string | number | null, string | number | null>;

export interface DiariaTable {
  id: Generated<number>;
  emp_codigo: string;
  cte: number;
  serie: string | null;
  cte_complementar: number | null;
  motorista_id: number | null;
  prontuario: string;
  nome_motorista: string;
  dt: string | null;
  data_emissao: DateColumn;
  data_entrega: DateColumn;
  qtde_diaria: number;
  valor_diaria: NumericColumn;
  total_diaria: NumericColumn;
  data_baixa: NullableDateColumn;
  baixado: ColumnType<boolean, boolean | undefined, boolean | undefined>;
  criado_em: NullableTimestampColumn;
  excluido_em: NullableTimestampColumn;
  usuario: string | null;
  supervisor: string | null;
}

export interface DiariaRecebimentoTable {
  id: Generated<number>;
  diaria_id: number;
  data_recebimento: DateColumn;
  qtde_diaria: ColumnType<number | null, number | null | undefined, number | null | undefined>;
  valor_diaria: NullableNumericColumn;
  total_diaria: NullableNumericColumn;
  criado_em: NullableTimestampColumn;
  observacao: string | null;
  usuario: string | null;
}

export interface Database {
  diaria: DiariaTable;
  diaria_recebimento: DiariaRecebimentoTable;
}

let db: Kysely<Database> | null = null;

export async function initializePostgres(): Promise<Kysely<Database>> {
  if (db) {
    return db;
  }

  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    max: parseInt(process.env.POSTGRES_POOL_SIZE || '10', 10),
  });

  pool.on('error', (error: Error) => {
    logger.error({ error }, 'Erro na conexão com o PostgreSQL');
  });

  const dialect = new PostgresDialect({ pool });
  db = new Kysely<Database>({ dialect });
  logger.info('Conexão Kysely/PostgreSQL inicializada');
  return db;
}

export function getPostgresDb(): Kysely<Database> {
  if (!db) {
    throw new Error('Conexão com PostgreSQL não foi inicializada');
  }
  return db;
}

export async function closePostgres(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
    logger.info('Conexão Kysely/PostgreSQL encerrada');
  }
}

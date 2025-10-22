import { getConnection, releaseConnection } from '../db/firebird';
import { CST_IBSCBS } from '../models/cst_ibscbs';
import logger from '../utils/logger';

export class CstIbscbsRepository {
  /**
   * Busca todos os registros com paginação e filtros
   */
  static findAll(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<CST_IBSCBS[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) {
          logger.error('Erro ao obter conexão');
          return reject(new Error('Erro de conexão com o banco'));
        }

        const sort = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : '';
        const sql = `SELECT * FROM CST_IBSCBS ${sort} ROWS ${offset + 1} TO ${offset + limit}`;

        db.query(sql, [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao consultar CST_IBSCBS');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  /**
   * Busca um registro pelo ID
   */
  static findById(id: number): Promise<CST_IBSCBS | null> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT * FROM CST_IBSCBS WHERE ID = ?', [id], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CST_IBSCBS por ID');
            return reject(err);
          }
          resolve(result && result.length > 0 ? result[0] : null);
        });
      });
    });
  }

  /**
   * Cria um novo registro
   */
  static create(data: Omit<CST_IBSCBS, 'ID' | 'CREATED_AT' | 'UPDATED_AT'>): Promise<number> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        const sql = `INSERT INTO CST_IBSCBS (CODIGO, DESCRICAO, TRIBUTACAO_REGULAR, REDUCAO_BC_CST, REDUCAO_ALIQUOTA, TRANSFERENCIA_CREDITO, DIFERIMENTO, MONOFASICA, CREDITO_PRESUMIDO_IBS_ZFM, AJUSTE_COMPETENCIA) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
          data.CODIGO, data.DESCRICAO, data.TRIBUTACAO_REGULAR, data.REDUCAO_BC_CST,
          data.REDUCAO_ALIQUOTA, data.TRANSFERENCIA_CREDITO, data.DIFERIMENTO,
          data.MONOFASICA, data.CREDITO_PRESUMIDO_IBS_ZFM, data.AJUSTE_COMPETENCIA,
        ];

        db.query(sql, values, (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao inserir CST_IBSCBS');
            return reject(err);
          }
          resolve(result?.insertId || 0);
        });
      });
    });
  }

  /**
   * Atualiza um registro
   */
  static update(id: number, data: Partial<CST_IBSCBS>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        const fields = Object.keys(data).filter(k => k !== 'ID' && k !== 'CREATED_AT');
        const values = fields.map(k => data[k as keyof CST_IBSCBS]);
        values.push(id);

        const setClause = fields.map(f => `${f}=?`).join(', ');
        const sql = `UPDATE CST_IBSCBS SET ${setClause} WHERE ID=?`;

        db.query(sql, values, (err: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao atualizar CST_IBSCBS');
            return reject(err);
          }
          resolve(true);
        });
      });
    });
  }

  /**
   * Deleta um registro
   */
  static delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('DELETE FROM CST_IBSCBS WHERE ID=?', [id], (err: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao deletar CST_IBSCBS');
            return reject(err);
          }
          resolve(true);
        });
      });
    });
  }

  /**
   * Busca um registro pelo CODIGO (pesquisa exata)
   */
  static findByCodigo(codigo: string): Promise<CST_IBSCBS | null> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT * FROM CST_IBSCBS WHERE CODIGO = ?', [codigo], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CST_IBSCBS por CODIGO');
            return reject(err);
          }
          resolve(result && result.length > 0 ? result[0] : null);
        });
      });
    });
  }

  /**
   * Busca registros pelo DESCRICAO (pesquisa por aproximação - LIKE)
   */
  static findByDescricao(descricao: string): Promise<CST_IBSCBS[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT * FROM CST_IBSCBS WHERE DESCRICAO LIKE ?', [`%${descricao}%`], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CST_IBSCBS por DESCRICAO');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  /**
   * Conta total de registros
   */
  static count(): Promise<number> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT COUNT(*) as total FROM CST_IBSCBS', [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao contar CST_IBSCBS');
            return reject(err);
          }
          resolve(result?.[0]?.total || 0);
        });
      });
    });
  }
}

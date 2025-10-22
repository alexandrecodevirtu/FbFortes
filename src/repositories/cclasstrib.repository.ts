import { getConnection, releaseConnection } from '../db/firebird';
import { CCLASSTRIB } from '../models/cclasstrib';
import logger from '../utils/logger';

export class CclasstribRepository {
  /**
   * Busca todos os registros com paginação e filtros
   */
  static findAll(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<CCLASSTRIB[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) {
          logger.error('Erro ao obter conexão');
          return reject(new Error('Erro de conexão com o banco'));
        }

        const sort = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : '';
        const sql = `SELECT * FROM CCLASSTRIB ${sort} ROWS ${offset + 1} TO ${offset + limit}`;

        db.query(sql, [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao consultar CCLASSTRIB');
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
  static findById(id: number): Promise<CCLASSTRIB | null> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT * FROM CCLASSTRIB WHERE ID = ?', [id], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CCLASSTRIB por ID');
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
  static create(data: Omit<CCLASSTRIB, 'ID' | 'CREATED_AT' | 'UPDATED_AT'>): Promise<number> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        const sql = `INSERT INTO CCLASSTRIB (CST_IBSCBS_ID, CODIGO, DESCRICAO, PERCENTUAL_REDUCAO_IBS, PERCENTUAL_REDUCAO_CBS, REDUCAO_BC, CREDITO_PRESUMIDO, ESTORNO_CREDITO, TIPO_ALIQUOTA, NFE, NFCE, CTE, CTE_OS, BPE, NF3E, NFCOM, NFSE, BPE_TM, BPE_TA, NFAG, NFSVIA, NFABI, NFGAS, DERE, NUMERO_ANEXO, URL_LEGISLACAO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
          data.CST_IBSCBS_ID, data.CODIGO, data.DESCRICAO, data.PERCENTUAL_REDUCAO_IBS,
          data.PERCENTUAL_REDUCAO_CBS, data.REDUCAO_BC, data.CREDITO_PRESUMIDO,
          data.ESTORNO_CREDITO, data.TIPO_ALIQUOTA, data.NFE, data.NFCE, data.CTE,
          data.CTE_OS, data.BPE, data.NF3E, data.NFCOM, data.NFSE, data.BPE_TM,
          data.BPE_TA, data.NFAG, data.NFSVIA, data.NFABI, data.NFGAS, data.DERE,
          data.NUMERO_ANEXO, data.URL_LEGISLACAO,
        ];

        db.query(sql, values, (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao inserir CCLASSTRIB');
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
  static update(id: number, data: Partial<CCLASSTRIB>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        const fields = Object.keys(data).filter(k => k !== 'ID' && k !== 'CREATED_AT');
        const values = fields.map(k => data[k as keyof CCLASSTRIB]);
        values.push(id);

        const setClause = fields.map(f => `${f}=?`).join(', ');
        const sql = `UPDATE CCLASSTRIB SET ${setClause} WHERE ID=?`;

        db.query(sql, values, (err: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao atualizar CCLASSTRIB');
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

        db.query('DELETE FROM CCLASSTRIB WHERE ID=?', [id], (err: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao deletar CCLASSTRIB');
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
  static findByCodigo(codigo: string): Promise<CCLASSTRIB | null> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT * FROM CCLASSTRIB WHERE CODIGO = ?', [codigo], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CCLASSTRIB por CODIGO');
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
  static findByDescricao(descricao: string): Promise<CCLASSTRIB[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT * FROM CCLASSTRIB WHERE DESCRICAO LIKE ?', [`%${descricao}%`], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CCLASSTRIB por DESCRICAO');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  /**
   * Busca registros pelo CST_IBSCBS_ID
   */
  static findByCstIbscbsId(cstIbscbsId: number): Promise<CCLASSTRIB[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));

        db.query('SELECT * FROM CCLASSTRIB WHERE CST_IBSCBS_ID = ?', [cstIbscbsId], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CCLASSTRIB por CST_IBSCBS_ID');
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

        db.query('SELECT COUNT(*) as total FROM CCLASSTRIB', [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao contar CCLASSTRIB');
            return reject(err);
          }
          resolve(result?.[0]?.total || 0);
        });
      });
    });
  }
}

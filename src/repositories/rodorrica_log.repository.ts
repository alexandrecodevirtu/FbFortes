import { getConnection, releaseConnection } from '../db/firebird';
import { RodorricaLog } from '../models/rodorrica_log';
import logger from '../utils/logger';

export class RodorricaLogRepository {
  /**
   * Busca todos os registros com paginação
   */
  static findAll(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<RodorricaLog[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) {
          logger.error('Erro ao obter conexão');
          return reject(new Error('Erro de conexão com o banco'));
        }
        const sort = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : 'ORDER BY ID DESC';
        const sql = `SELECT * FROM RODORRICA_LOG ${sort} ROWS ${offset + 1} TO ${offset + limit}`;
        db.query(sql, [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao consultar RODORRICA_LOG');
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
  static findById(id: number): Promise<RodorricaLog | null> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        db.query('SELECT * FROM RODORRICA_LOG WHERE ID = ?', [id], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar RODORRICA_LOG por ID');
            return reject(err);
          }
          resolve(result && result.length > 0 ? result[0] : null);
        });
      });
    });
  }

  /**
   * Busca registros por NOME_TABELA
   */
  static findByNomeTabela(nomeTabela: string): Promise<RodorricaLog[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        db.query('SELECT * FROM RODORRICA_LOG WHERE NOME_TABELA = ? ORDER BY ID DESC', [nomeTabela], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar RODORRICA_LOG por NOME_TABELA');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  /**
   * Busca registros por EMP_CODIGO
   */
  static findByEmpCodigo(empCodigo: string): Promise<RodorricaLog[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        db.query('SELECT * FROM RODORRICA_LOG WHERE EMP_CODIGO = ? ORDER BY ID DESC', [empCodigo], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar RODORRICA_LOG por EMP_CODIGO');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  /**
   * Busca registros por status de replicação
   */
  static findByReplicado(replicado: string): Promise<RodorricaLog[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        db.query('SELECT * FROM RODORRICA_LOG WHERE REPLICADO = ? ORDER BY ID DESC', [replicado], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar RODORRICA_LOG por REPLICADO');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  /**
   * Cria um novo registro
   */
  static create(data: RodorricaLog): Promise<RodorricaLog> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        const sql = `INSERT INTO RODORRICA_LOG (NOME_TABELA, TIPO_OPERACAO, EMP_CODIGO, SERIE, CODIGO, REPLICADO) 
                     VALUES (?, ?, ?, ?, ?, ?) RETURNING ID`;
        db.query(sql, [
          data.NOME_TABELA,
          data.TIPO_OPERACAO,
          data.EMP_CODIGO,
          data.SERIE || null,
          data.CODIGO,
          data.REPLICADO
        ], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao criar RODORRICA_LOG');
            return reject(err);
          }
          resolve({ ...data, ID: result[0].ID });
        });
      });
    });
  }

  /**
   * Atualiza um registro
   */
  static update(id: number, data: Partial<RodorricaLog>): Promise<RodorricaLog | null> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        
        const fields: string[] = [];
        const values: any[] = [];

        if (data.NOME_TABELA !== undefined) {
          fields.push('NOME_TABELA = ?');
          values.push(data.NOME_TABELA);
        }
        if (data.TIPO_OPERACAO !== undefined) {
          fields.push('TIPO_OPERACAO = ?');
          values.push(data.TIPO_OPERACAO);
        }
        if (data.EMP_CODIGO !== undefined) {
          fields.push('EMP_CODIGO = ?');
          values.push(data.EMP_CODIGO);
        }
        if (data.SERIE !== undefined) {
          fields.push('SERIE = ?');
          values.push(data.SERIE);
        }
        if (data.CODIGO !== undefined) {
          fields.push('CODIGO = ?');
          values.push(data.CODIGO);
        }
        if (data.DATA_REPLICACAO !== undefined) {
          fields.push('DATA_REPLICACAO = ?');
          values.push(data.DATA_REPLICACAO);
        }
        if (data.REPLICADO !== undefined) {
          fields.push('REPLICADO = ?');
          values.push(data.REPLICADO);
        }

        if (fields.length === 0) {
          return reject(new Error('Nenhum campo para atualizar'));
        }

        values.push(id);
        const sql = `UPDATE RODORRICA_LOG SET ${fields.join(', ')} WHERE ID = ?`;
        
        db.query(sql, values, (err: any) => {
          if (err) {
            releaseConnection(db);
            logger.error({ err }, 'Erro ao atualizar RODORRICA_LOG');
            return reject(err);
          }
          
          // Busca o registro atualizado
          this.findById(id).then(resolve).catch(reject);
        });
      });
    });
  }

  /**
   * Deleta um registro
   */
  static delete(id: number): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        db.query('DELETE FROM RODORRICA_LOG WHERE ID = ?', [id], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao deletar RODORRICA_LOG');
            return reject(err);
          }
          resolve({ success: true });
        });
      });
    });
  }

  /**
   * Conta o total de registros
   */
  static count(): Promise<number> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        db.query('SELECT COUNT(*) as total FROM RODORRICA_LOG', [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao contar registros RODORRICA_LOG');
            return reject(err);
          }
          resolve(result[0].TOTAL || 0);
        });
      });
    });
  }
}

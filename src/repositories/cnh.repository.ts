
import { getConnection, releaseConnection } from '../db/firebird';
import { CNH } from '../models/cnh';
import logger from '../utils/logger';

export class CNHRepository {
  /**
   * Busca todos os registros de CNH
   */
  static findAll(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<CNH[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) {
          logger.error('Erro ao obter conexão');
          return reject(new Error('Erro de conexão com o banco'));
        }
        const sort = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : '';
        const sql = `SELECT * FROM CNH ${sort} ROWS ${offset + 1} TO ${offset + limit}`;
        db.query(sql, [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao consultar CNH');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  /**
   * Busca um registro pelo ID composto
   */
  static findById(emp_codigo: string, serie: string, ctrc: number): Promise<CNH | null> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) return reject(new Error('Erro de conexão com o banco'));
        // db.query('SELECT * FROM CNH WHERE EMP_CODIGO = ? AND SERIE = ? AND CTRC = ?', [emp_codigo, serie, ctrc], (err: any, result: any) => {
        db.query('SELECT EMP_CODIGO, SERIE, CTRC, DATA, CTRCREDESP, EMP_CODIGO_REDESPACHO, SERIE_REDESPACHO, VRDIARIAS FROM CNH WHERE EMP_CODIGO = ? AND SERIE = ? AND CTRC = ? AND RODORICA_REPLICA = 0', [emp_codigo, serie, ctrc], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao buscar CNH por ID');
            return reject(err);
          }
          resolve(result && result.length > 0 ? result[0] : null);
        });
      });
    });
  }

  /**
   * Busca todos os registros onde EMP_CODIGO LIKE 'D%' e RODORICA_REPLICA = 0
   */
  static findByEmpCodigoD(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<CNH[]> {
    return new Promise((resolve, reject) => {
      getConnection((err, db) => {
        if (err || !db) {
          logger.error('Erro ao obter conexão');
          return reject(new Error('Erro de conexão com o banco'));
        }
        const sort = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : '';
        const sql = `SELECT EMP_CODIGO, SERIE, CTRC, DATA, CTRCREDESP, EMP_CODIGO_REDESPACHO, SERIE_REDESPACHO, VRDIARIAS FROM CNH WHERE EMP_CODIGO LIKE 'D%' AND RODORICA_REPLICA = 0 ${sort} ROWS ${offset + 1} TO ${offset + limit}`;
        db.query(sql, [], (err: any, result: any) => {
          releaseConnection(db);
          if (err) {
            logger.error({ err }, 'Erro ao consultar CNH por EMP_CODIGO LIKE D%');
            return reject(err);
          }
          resolve(result || []);
        });
      });
    });
  }

  // Métodos de insert, update, delete podem ser adicionados conforme necessário
}

import { CstIbscbsRepository } from '../repositories/cst_ibscbs.repository';
import { CST_IBSCBS } from '../models/cst_ibscbs';
import logger from '../utils/logger';

export class CstIbscbsService {
  /**
   * Busca todos os registros com paginação
   */
  static async getAllWithPagination(limit: number, offset: number, sortBy?: string, sortOrder?: string) {
    try {
      const [data, total] = await Promise.all([
        CstIbscbsRepository.findAll(limit, offset, sortBy, sortOrder),
        CstIbscbsRepository.count(),
      ]);

      return {
        data,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(error, 'Erro ao buscar CST_IBSCBS');
      throw error;
    }
  }

  /**
   * Busca um registro pelo ID
   */
  static async getById(id: number) {
    try {
      const record = await CstIbscbsRepository.findById(id);
      if (!record) {
        throw new Error('Registro não encontrado');
      }
      return record;
    } catch (error) {
      logger.error(error, 'Erro ao buscar CST_IBSCBS por ID');
      throw error;
    }
  }

  /**
   * Cria um novo registro
   */
  static async create(data: Omit<CST_IBSCBS, 'ID' | 'CREATED_AT' | 'UPDATED_AT'>) {
    try {
      const id = await CstIbscbsRepository.create(data);
      logger.info(`Novo CST_IBSCBS criado com ID: ${id}`);
      return await CstIbscbsRepository.findById(id);
    } catch (error) {
      logger.error(error, 'Erro ao criar CST_IBSCBS');
      throw error;
    }
  }

  /**
   * Atualiza um registro
   */
  static async update(id: number, data: Partial<CST_IBSCBS>) {
    try {
      // Valida se existe
      await this.getById(id);
      await CstIbscbsRepository.update(id, data);
      logger.info(`CST_IBSCBS ${id} atualizado`);
      return await CstIbscbsRepository.findById(id);
    } catch (error) {
      logger.error(error, 'Erro ao atualizar CST_IBSCBS');
      throw error;
    }
  }

  /**
   * Busca um registro pelo CODIGO (pesquisa exata)
   */
  static async getByCodigo(codigo: string) {
    try {
      const record = await CstIbscbsRepository.findByCodigo(codigo);
      if (!record) {
        throw new Error('Registro não encontrado');
      }
      return record;
    } catch (error) {
      logger.error(error, 'Erro ao buscar CST_IBSCBS por CODIGO');
      throw error;
    }
  }

  /**
   * Busca registros pelo DESCRICAO (pesquisa por aproximação)
   */
  static async getByDescricao(descricao: string) {
    try {
      const records = await CstIbscbsRepository.findByDescricao(descricao);
      if (records.length === 0) {
        logger.info(`Nenhum resultado encontrado para descrição: ${descricao}`);
      }
      return {
        data: records,
        count: records.length,
      };
    } catch (error) {
      logger.error(error, 'Erro ao buscar CST_IBSCBS por DESCRICAO');
      throw error;
    }
  }

  /**
   * Deleta um registro
   */
  static async delete(id: number) {
    try {
      await this.getById(id);
      await CstIbscbsRepository.delete(id);
      logger.info(`CST_IBSCBS ${id} deletado`);
      return { success: true, id };
    } catch (error) {
      logger.error(error, 'Erro ao deletar CST_IBSCBS');
      throw error;
    }
  }
}

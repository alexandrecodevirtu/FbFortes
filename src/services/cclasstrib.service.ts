import { CclasstribRepository } from '../repositories/cclasstrib.repository';
import { CCLASSTRIB } from '../models/cclasstrib';
import logger from '../utils/logger';

export class CclasstribService {
  /**
   * Busca todos os registros com paginação
   */
  static async getAllWithPagination(limit: number, offset: number, sortBy?: string, sortOrder?: string) {
    try {
      const [data, total] = await Promise.all([
        CclasstribRepository.findAll(limit, offset, sortBy, sortOrder),
        CclasstribRepository.count(),
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
      logger.error(error, 'Erro ao buscar CCLASSTRIB');
      throw error;
    }
  }

  /**
   * Busca um registro pelo ID
   */
  static async getById(id: number) {
    try {
      const record = await CclasstribRepository.findById(id);
      if (!record) {
        throw new Error('Registro não encontrado');
      }
      return record;
    } catch (error) {
      logger.error(error, 'Erro ao buscar CCLASSTRIB por ID');
      throw error;
    }
  }

  /**
   * Cria um novo registro
   */
  static async create(data: Omit<CCLASSTRIB, 'ID' | 'CREATED_AT' | 'UPDATED_AT'>) {
    try {
      const id = await CclasstribRepository.create(data);
      logger.info(`Novo CCLASSTRIB criado com ID: ${id}`);
      return await CclasstribRepository.findById(id);
    } catch (error) {
      logger.error(error, 'Erro ao criar CCLASSTRIB');
      throw error;
    }
  }

  /**
   * Atualiza um registro
   */
  static async update(id: number, data: Partial<CCLASSTRIB>) {
    try {
      await this.getById(id);
      await CclasstribRepository.update(id, data);
      logger.info(`CCLASSTRIB ${id} atualizado`);
      return await CclasstribRepository.findById(id);
    } catch (error) {
      logger.error(error, 'Erro ao atualizar CCLASSTRIB');
      throw error;
    }
  }

  /**
   * Busca um registro pelo CODIGO (pesquisa exata)
   */
  static async getByCodigo(codigo: string) {
    try {
      const record = await CclasstribRepository.findByCodigo(codigo);
      if (!record) {
        throw new Error('Registro não encontrado');
      }
      return record;
    } catch (error) {
      logger.error(error, 'Erro ao buscar CCLASSTRIB por CODIGO');
      throw error;
    }
  }

  /**
   * Busca registros pelo DESCRICAO (pesquisa por aproximação)
   */
  static async getByDescricao(descricao: string) {
    try {
      const records = await CclasstribRepository.findByDescricao(descricao);
      if (records.length === 0) {
        logger.info(`Nenhum resultado encontrado para descrição: ${descricao}`);
      }
      return {
        data: records,
        count: records.length,
      };
    } catch (error) {
      logger.error(error, 'Erro ao buscar CCLASSTRIB por DESCRICAO');
      throw error;
    }
  }

  /**
   * Busca registros pelo CST_IBSCBS_ID
   */
  static async getByCstIbscbsId(cstIbscbsId: number) {
    try {
      const records = await CclasstribRepository.findByCstIbscbsId(cstIbscbsId);
      if (records.length === 0) {
        logger.info(`Nenhum resultado encontrado para CST_IBSCBS_ID: ${cstIbscbsId}`);
      }
      return {
        data: records,
        count: records.length,
      };
    } catch (error) {
      logger.error(error, 'Erro ao buscar CCLASSTRIB por CST_IBSCBS_ID');
      throw error;
    }
  }

  /**
   * Deleta um registro
   */
  static async delete(id: number) {
    try {
      await this.getById(id);
      await CclasstribRepository.delete(id);
      logger.info(`CCLASSTRIB ${id} deletado`);
      return { success: true, id };
    } catch (error) {
      logger.error(error, 'Erro ao deletar CCLASSTRIB');
      throw error;
    }
  }
}

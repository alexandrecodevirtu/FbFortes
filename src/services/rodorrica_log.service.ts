import { RodorricaLogRepository } from '../repositories/rodorrica_log.repository';
import { RodorricaLog } from '../models/rodorrica_log';

export class RodorricaLogService {
  /**
   * Busca todos os registros com paginação
   */
  static async getAllWithPagination(
    limit: number,
    offset: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ data: RodorricaLog[]; total: number; limit: number; offset: number }> {
    const data = await RodorricaLogRepository.findAll(limit, offset, sortBy, sortOrder);
    const total = await RodorricaLogRepository.count();
    return { data, total, limit, offset };
  }

  /**
   * Busca um registro pelo ID
   */
  static async getById(id: number): Promise<RodorricaLog> {
    const record = await RodorricaLogRepository.findById(id);
    if (!record) {
      throw new Error(`Registro com ID ${id} não encontrado`);
    }
    return record;
  }

  /**
   * Busca registros por NOME_TABELA
   */
  static async getByNomeTabela(nomeTabela: string): Promise<RodorricaLog[]> {
    return RodorricaLogRepository.findByNomeTabela(nomeTabela);
  }

  /**
   * Busca registros por EMP_CODIGO
   */
  static async getByEmpCodigo(empCodigo: string): Promise<RodorricaLog[]> {
    return RodorricaLogRepository.findByEmpCodigo(empCodigo);
  }

  /**
   * Busca registros por status de replicação
   */
  static async getByReplicado(replicado: string): Promise<RodorricaLog[]> {
    if (replicado !== 'S' && replicado !== 'N') {
      throw new Error('REPLICADO deve ser "S" ou "N"');
    }
    return RodorricaLogRepository.findByReplicado(replicado);
  }

  /**
   * Cria um novo registro
   */
  static async create(data: RodorricaLog): Promise<RodorricaLog> {
    // Validações de negócio
    if (!['I', 'U', 'D'].includes(data.TIPO_OPERACAO)) {
      throw new Error('TIPO_OPERACAO deve ser "I" (Insert), "U" (Update) ou "D" (Delete)');
    }
    if (!['S', 'N'].includes(data.REPLICADO)) {
      throw new Error('REPLICADO deve ser "S" ou "N"');
    }
    return RodorricaLogRepository.create(data);
  }

  /**
   * Atualiza um registro
   */
  static async update(id: number, data: Partial<RodorricaLog>): Promise<RodorricaLog> {
    // Validações de negócio
    if (data.TIPO_OPERACAO && !['I', 'U', 'D'].includes(data.TIPO_OPERACAO)) {
      throw new Error('TIPO_OPERACAO deve ser "I" (Insert), "U" (Update) ou "D" (Delete)');
    }
    if (data.REPLICADO && !['S', 'N'].includes(data.REPLICADO)) {
      throw new Error('REPLICADO deve ser "S" ou "N"');
    }
    
    const record = await RodorricaLogRepository.update(id, data);
    if (!record) {
      throw new Error(`Registro com ID ${id} não encontrado`);
    }
    return record;
  }

  /**
   * Deleta um registro
   */
  static async delete(id: number): Promise<{ success: boolean; message: string }> {
    const exists = await RodorricaLogRepository.findById(id);
    if (!exists) {
      throw new Error(`Registro com ID ${id} não encontrado`);
    }
    await RodorricaLogRepository.delete(id);
    return { success: true, message: 'Registro deletado com sucesso' };
  }

  /**
   * Marca um registro como replicado
   */
  static async markAsReplicado(id: number): Promise<RodorricaLog> {
    return this.update(id, { 
      REPLICADO: 'S', 
      DATA_REPLICACAO: new Date() 
    });
  }

  /**
   * Marca múltiplos registros como replicados
   */
  static async markMultipleAsReplicado(ids: number[]): Promise<{ success: boolean; updated: number }> {
    let updated = 0;
    for (const id of ids) {
      try {
        await this.markAsReplicado(id);
        updated++;
      } catch (error) {
        // Continua mesmo se algum falhar
      }
    }
    return { success: true, updated };
  }
}

import { CNHRepository } from '../repositories/cnh.repository';
import { CNH } from '../models/cnh';

export class CNHService {
  static async getAll(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<CNH[]> {
    return CNHRepository.findAll(limit, offset, sortBy, sortOrder);
  }

  static async getById(emp_codigo: string, serie: string, ctrc: number): Promise<CNH | null> {
    return CNHRepository.findById(emp_codigo, serie, ctrc);
  }

  static async getByEmpCodigoD(limit: number, offset: number, sortBy?: string, sortOrder?: string): Promise<CNH[]> {
    return CNHRepository.findByEmpCodigoD(limit, offset, sortBy, sortOrder);
  }

  // Métodos de criação, atualização e remoção podem ser adicionados conforme necessário
}

import type { IUserRepository } from '../interfaces/repositories.js';
import type { RoleGrantedData, RoleRevokedData } from '../types/lottery.types.js';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async ensureUserExists(address: string): Promise<void> {
    await this.userRepository.ensureExists(address);
  }

  async grantRole(data: RoleGrantedData): Promise<void> {
    // Ensure user exists first
    await this.userRepository.ensureExists(data.account);
    
    // Grant the role
    await this.userRepository.grantRole(data);
  }

  async revokeRole(data: RoleRevokedData): Promise<void> {
    await this.userRepository.revokeRole(data);
  }

  async getUserByAddress(address: string): Promise<any | null> {
    return this.userRepository.getUserByAddress(address);
  }
}
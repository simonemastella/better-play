import { eq, and } from 'drizzle-orm';
import { users, userRoles, type UserRoleType, type Database } from '@better-play/database';
import type { IUserRepository, IEventRepository, EventData } from '../interfaces/repositories.js';
import type { RoleGrantedData, RoleRevokedData } from '../types/lottery.types.js';

type TransactionClient = Parameters<Parameters<Database['transaction']>[0]>[0];

// Map role bytes32 hashes to role names
const ROLE_MAPPING: Record<string, UserRoleType> = {
  "0x0000000000000000000000000000000000000000000000000000000000000000":
    "DEFAULT_ADMIN_ROLE",
  "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929":
    "OPERATOR_ROLE",
  "0x3496e2e73c4d42b75d702e60d9e48102720b8691234415963a5a857b86425d07":
    "TREASURER_ROLE",
  "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a":
    "PAUSER_ROLE",
};

export class UserRepository implements IUserRepository {
  constructor(
    private database: Database,
    private eventRepository: IEventRepository
  ) {}

  async ensureExists(address: string, tx?: TransactionClient): Promise<void> {
    const db = tx || this.database;
    await db
      .insert(users)
      .values({ address })
      .onConflictDoNothing();
  }

  async grantRole(data: RoleGrantedData, eventData: EventData, tx?: TransactionClient): Promise<void> {
    const execute = async (txClient: TransactionClient) => {
      const roleName = ROLE_MAPPING[data.role] || "UNKNOWN";

      await txClient
        .insert(userRoles)
        .values({
          userAddress: data.account,
          role: roleName,
          eventTxId: data.txId,
          eventLogIndex: data.logIndex,
        })
        .onConflictDoNothing();

      await this.eventRepository.save(
        {
          txId: eventData.txId,
          logIndex: eventData.logIndex,
          eventName: "RoleGranted",
          blockNumber: eventData.blockNumber,
          decoded: eventData.decoded,
        },
        txClient
      );
    };

    tx ? await execute(tx) : await this.database.transaction(execute);
  }

  async revokeRole(data: RoleRevokedData, eventData: EventData, tx?: TransactionClient): Promise<void> {
    const execute = async (txClient: TransactionClient) => {
      const roleName = ROLE_MAPPING[data.role] || "UNKNOWN";

      await txClient
        .delete(userRoles)
        .where(
          and(
            eq(userRoles.userAddress, data.account),
            eq(userRoles.role, roleName)
          )
        );

      await this.eventRepository.save(
        {
          txId: eventData.txId,
          logIndex: eventData.logIndex,
          eventName: "RoleRevoked",
          blockNumber: eventData.blockNumber,
          decoded: eventData.decoded,
        },
        txClient
      );
    };

    tx ? await execute(tx) : await this.database.transaction(execute);
  }

  async getUserByAddress(address: string): Promise<any | null> {
    const result = await this.database
      .select()
      .from(users)
      .where(eq(users.address, address))
      .limit(1);
    
    return result[0] || null;
  }
}
export interface CreateRoundData {
  roundId: number;
  ticketPrice: number;
  prizes: number[];
  endBlock: number;
}

export interface CreateTicketData {
  ticketId: number;
  roundId: number;
  buyer: string;
  eventTxId: string;
  eventLogIndex: number;
}

export interface TicketPurchaseData {
  ticketId: number;
  buyer: string;
  roundId: number;
  price: number;
  txId: string;
  logIndex: number;
}

export interface RoundRevealData {
  roundId: number;
  winners: string[];
  prizes: number[];
  totalPrize: number;
}

export interface AmountIncreasedData {
  roundId: number;
  amount: number;
}

export interface RoleGrantedData {
  role: string;
  account: string;
  sender: string;
  txId: string;
  logIndex: number;
}

export interface RoleRevokedData {
  role: string;
  account: string;
  sender: string;
}
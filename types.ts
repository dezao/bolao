export interface Participant {
  id: string;
  name: string;
  phone: string;
  quotas: number;
  status: 'Pago' | 'Pendente';
}

export type FinancialRecordType = 'Aposta' | 'Premiação';

export interface FinancialRecord {
  id: string;
  date: string; 
  type: FinancialRecordType;
  amount: number;
}

export interface Pool {
  id: string;
  name: string;
  participants: Participant[];
  financialRecords: FinancialRecord[];
}

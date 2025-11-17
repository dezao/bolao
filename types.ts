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
  description?: string;
}

export interface Pool {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  quotaValue: number;
  participants: Participant[];
  financialRecords: FinancialRecord[];
  status: 'Em andamento' | 'Encerrado';
}
import React, { useState, useMemo } from 'react';
import { FinancialRecord, FinancialRecordType } from '../types';
import { TrashIcon, CalendarIcon, CurrencyDollarIcon, TagIcon, PencilIcon } from './icons';

// Props for the main component
interface FinancialTabProps {
  records: FinancialRecord[];
  isAdmin: boolean;
  onAdd: (recordData: Omit<FinancialRecord, 'id'>) => void;
  onDelete: (id: string) => void;
  valorArrecadado: number;
}

// Props for the form component
interface AddFinancialRecordFormProps {
    onAdd: (recordData: Omit<FinancialRecord, 'id'>) => void;
}

// Sub-component for the form to add financial records
const AddFinancialRecordForm: React.FC<AddFinancialRecordFormProps> = ({ onAdd }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<FinancialRecordType>('Aposta');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date && type && amount) {
            onAdd({ date, type, amount: parseFloat(amount), description });
            // Reset form
            setDate(new Date().toISOString().split('T')[0]);
            setType('Aposta');
            setAmount('');
            setDescription('');
        }
    };

    const commonInputClasses = "block w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Adicionar Registro Financeiro</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="record-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></div>
                           <input id="record-date" type="date" value={date} onChange={e => setDate(e.target.value)} required className={commonInputClasses} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="record-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></div>
                            <select id="record-type" value={type} onChange={e => setType(e.target.value as FinancialRecordType)} required className={`appearance-none ${commonInputClasses}`}>
                                <option value="Aposta">Aposta (saída)</option>
                                <option value="Premiação">Premiação (ganho)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="record-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyDollarIcon className="h-5 w-5 text-gray-400" /></div>
                            <input id="record-amount" type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required className={commonInputClasses} placeholder="0.00" />
                        </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="record-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (Opcional)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PencilIcon className="h-5 w-5 text-gray-400" /></div>
                        <input id="record-description" type="text" value={description} onChange={e => setDescription(e.target.value)} className={commonInputClasses} placeholder="Ex: Aposta na Mega-Sena" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Adicionar Registro</button>
                </div>
            </form>
        </div>
    );
};

// Main component
const FinancialTab: React.FC<FinancialTabProps> = ({ records, isAdmin, onAdd, onDelete, valorArrecadado }) => {
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const financialSummary = useMemo(() => {
        const totalApostas = records
            .filter(r => r.type === 'Aposta')
            .reduce((sum, r) => sum + r.amount, 0);

        const totalPremiacoes = records
            .filter(r => r.type === 'Premiação')
            .reduce((sum, r) => sum + r.amount, 0);
        
        const saldo = valorArrecadado - totalApostas + totalPremiacoes;

        return { totalApostas, totalPremiacoes, saldo };
    }, [records, valorArrecadado]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Valor Arrecadado</h4>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(valorArrecadado)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Total de Apostas</h4>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(financialSummary.totalApostas)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Total de Premiações</h4>
                    <p className="text-2xl font-bold text-teal-500">{formatCurrency(financialSummary.totalPremiacoes)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                    <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Saldo Final</h4>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.saldo)}</p>
                </div>
            </div>
            
            {isAdmin && <AddFinancialRecordForm onAdd={onAdd} />}

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Histórico Financeiro ({records.length})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-3">Data</th>
                                <th scope="col" className="px-4 py-3">Tipo</th>
                                <th scope="col" className="px-4 py-3">Descrição</th>
                                <th scope="col" className="px-4 py-3 text-right">Valor</th>
                                {isAdmin && <th scope="col" className="px-4 py-3 text-right">Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
                                <tr key={r.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-3">{new Date(r.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            r.type === 'Premiação' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {r.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{r.description || '-'}</td>
                                    <td className={`px-4 py-3 text-right font-medium ${r.type === 'Premiação' ? 'text-green-500' : 'text-red-500'}`}>
                                        {r.type === 'Premiação' ? `+ ${formatCurrency(r.amount)}` : `- ${formatCurrency(r.amount)}`}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => onDelete(r.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="text-center py-4">Nenhum registro financeiro encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancialTab;
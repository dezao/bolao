import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { TrashIcon, PencilIcon, UserCircleIcon, PhoneIcon, HashtagIcon, TagIcon, CurrencyDollarIcon } from './icons';

interface ParticipantsTabProps {
  participants: Participant[];
  isAdmin: boolean;
  onSave: (participantData: Omit<Participant, 'id'>, id?: string) => void;
  onDelete: (id: string) => void;
  editingParticipant: Participant | null;
  setEditingParticipant: React.Dispatch<React.SetStateAction<Participant | null>>;
  onToggleStatus: (id: string) => void;
}

const ParticipantForm: React.FC<{ 
  onSave: (participantData: Omit<Participant, 'id'>, id?: string) => void;
  editingParticipant: Participant | null;
  onCancel: () => void;
}> = ({ onSave, editingParticipant, onCancel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [quotas, setQuotas] = useState('1');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pendente');

  useEffect(() => {
    if (editingParticipant) {
      setName(editingParticipant.name);
      setPhone(editingParticipant.phone);
      setQuotas(String(editingParticipant.quotas));
      setStatus(editingParticipant.status);
    } else {
      setName('');
      setPhone('');
      setQuotas('1');
      setStatus('Pendente');
    }
  }, [editingParticipant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && quotas) {
      onSave({
        name,
        phone,
        quotas: parseInt(quotas, 10),
        status,
      }, editingParticipant?.id);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Apply mask for (XX) X XXXX-XXXX
    value = value.replace(/\D/g, '');
    value = value.substring(0, 11);
    value = value.replace(/^(\d{2})/, '($1) ');
    value = value.replace(/^\((\d{2})\)\s(\d{1})/, '($1) $2 ');
    value = value.replace(/ (\d{4})(\d)/, ' $1-$2');
    setPhone(value);
  };

  const commonInputClasses = "block w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {editingParticipant ? 'Editar Participante' : 'Adicionar Participante'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserCircleIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className={commonInputClasses} placeholder="Nome completo" />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input id="phone" type="tel" value={phone} onChange={handlePhoneChange} className={commonInputClasses} placeholder="(XX) X XXXX-XXXX" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quotas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cotas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HashtagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="quotas" type="number" min="1" value={quotas} onChange={e => setQuotas(e.target.value)} required className={commonInputClasses} />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select id="status" value={status} onChange={e => setStatus(e.target.value as 'Pago' | 'Pendente')} className={`appearance-none ${commonInputClasses}`}>
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
              </div>
            </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
            {editingParticipant && <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400">Cancelar</button>}
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">{editingParticipant ? 'Salvar Alterações' : 'Adicionar Participante'}</button>
        </div>
      </form>
    </div>
  );
};

const formatDisplayPhone = (phone: string): string => {
    const digits = (phone || '').replace(/\D/g, '');
    if (digits.length === 11) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 3)} ${digits.substring(3, 7)}-${digits.substring(7)}`;
    }
    return phone; // Return as is if not 11 digits
};

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ participants, isAdmin, onSave, onDelete, editingParticipant, setEditingParticipant, onToggleStatus }) => {
    const totalQuotas = participants.reduce((sum, p) => sum + p.quotas, 0);
    const paidQuotas = participants.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.quotas, 0);
    const pendingQuotas = totalQuotas - paidQuotas;

    return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Total de Cotas</h4>
            <p className="text-2xl font-bold text-blue-600">{totalQuotas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Cotas Pagas</h4>
            <p className="text-2xl font-bold text-green-600">{paidQuotas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400">Cotas Pendentes</h4>
            <p className="text-2xl font-bold text-yellow-500">{pendingQuotas}</p>
        </div>
      </div>
      
      {isAdmin && (
        <ParticipantForm 
            onSave={onSave} 
            editingParticipant={editingParticipant} 
            onCancel={() => setEditingParticipant(null)} 
        />
      )}

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Participantes ({participants.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">Nome</th>
                <th scope="col" className="px-4 py-3">Telefone</th>
                <th scope="col" className="px-4 py-3 text-center">Cotas</th>
                <th scope="col" className="px-4 py-3">Status</th>
                {isAdmin && <th scope="col" className="px-4 py-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {participants.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</td>
                  <td className="px-4 py-3">{formatDisplayPhone(p.phone)}</td>
                  <td className="px-4 py-3 text-center">{p.quotas}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'Pago' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                      {p.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => setEditingParticipant(p)} className="p-1 text-blue-500 hover:text-blue-700"><PencilIcon className="w-5 h-5"/></button>
                      <button 
                        onClick={() => onToggleStatus(p.id)} 
                        className={`p-1 ${p.status === 'Pendente' ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700'}`}
                        title={p.status === 'Pendente' ? 'Marcar como Pago' : 'Marcar como Pendente'}
                      >
                        <CurrencyDollarIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => onDelete(p.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                    </td>
                  )}
                </tr>
              ))}
              {participants.length === 0 && (
                  <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="text-center py-4">Nenhum participante cadastrado.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsTab;
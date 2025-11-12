
import React, { useState, useMemo, useEffect } from 'react';
import { Participant, FinancialRecord, Pool } from './types';
import Header from './components/Header';
import ParticipantsTab from './components/ParticipantsTab';
import FinancialTab from './components/FinancialTab';
import FaqTab from './components/FaqTab';
import Modal from './components/Modal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { UserCircleIcon, ChartBarIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, PlusCircleIcon, CollectionIcon, TagIcon, QuestionMarkCircleIcon } from './components/icons';

type ActiveTab = 'participants' | 'financial' | 'faq';

const ADMIN_PASSWORD = 'ricardo123';
const NPOINT_URL = 'https://api.npoint.io/52ef8aa3c656668a39e9';

const App: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('participants');
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'participant' | 'financial'} | null>(null);

  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(NPOINT_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const loadedPools = data.pools || [];
        setPools(loadedPools);
        if (loadedPools.length > 0) {
          setSelectedPoolId(loadedPools[0].id);
        } else {
          setActiveTab('faq');
        }
      } catch (e) {
        console.error("Failed to fetch data from npoint.io", e);
        setError("Não foi possível carregar os dados. Verifique sua conexão ou tente novamente.");
        showToast('Erro ao carregar os dados.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateRemoteData = async (newPools: Pool[]) => {
    try {
      const payload = { pools: newPools };
      const response = await fetch(NPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save data to npoint.io');
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar dados na nuvem.', 'error');
    }
  };

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminModal(false);
      setPassword('');
      setPasswordError('');
      setShowPassword(false);
      showToast('Modo Admin ativado!', 'success');
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setEditingParticipant(null);
      showToast('Modo Admin desativado.', 'success');
    } else {
      setShowAdminModal(true);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const selectedPool = useMemo(() => pools.find(p => p.id === selectedPoolId), [pools, selectedPoolId]);

  const handleSaveParticipant = (participantData: Omit<Participant, 'id'>, id?: string) => {
    if (!selectedPoolId) return;
    const newPools = pools.map(pool => {
      if (pool.id === selectedPoolId) {
        const updatedParticipants = id
          ? pool.participants.map(p => p.id === id ? { ...p, ...participantData } : p)
          : [...pool.participants, { ...participantData, id: new Date().toISOString() }];
        return { ...pool, participants: updatedParticipants };
      }
      return pool;
    });
    setPools(newPools);
    setEditingParticipant(null);
    updateRemoteData(newPools);
    showToast(id ? 'Participante atualizado!' : 'Participante adicionado!', 'success');
  };

  const handleToggleParticipantStatus = (participantId: string) => {
    if (!selectedPoolId) return;
    const newPools = pools.map(pool => {
      if (pool.id === selectedPoolId) {
        const updatedParticipants = pool.participants.map(p => {
          if (p.id === participantId) {
            return { ...p, status: p.status === 'Pago' ? 'Pendente' : 'Pago' };
          }
          return p;
        });
        return { ...pool, participants: updatedParticipants };
      }
      return pool;
    });
    setPools(newPools);
    updateRemoteData(newPools);
    showToast('Status do participante atualizado!', 'success');
  };

  const handleAddFinancialRecord = (recordData: Omit<FinancialRecord, 'id'>) => {
    if (!selectedPoolId) return;
    const newRecord: FinancialRecord = { ...recordData, id: new Date().toISOString() };
    const newPools = pools.map(pool => {
      if (pool.id === selectedPoolId) {
        const updatedRecords = [...pool.financialRecords, newRecord].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { ...pool, financialRecords: updatedRecords };
      }
      return pool;
    });
    setPools(newPools);
    updateRemoteData(newPools);
    showToast('Registro financeiro adicionado!', 'success');
  };

  const confirmDelete = (id: string, type: 'participant' | 'financial') => {
    setItemToDelete({ id, type });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    if (!itemToDelete || !selectedPoolId) return;
    const { id, type } = itemToDelete;
    const newPools = pools.map(pool => {
      if (pool.id === selectedPoolId) {
        if (type === 'participant') {
          return { ...pool, participants: pool.participants.filter(p => p.id !== id) };
        }
        if (type === 'financial') {
          return { ...pool, financialRecords: pool.financialRecords.filter(r => r.id !== id) };
        }
      }
      return pool;
    });
    setPools(newPools);
    updateRemoteData(newPools);
    showToast('Item excluído com sucesso.', 'success');
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleCreatePool = () => {
    if (!newPoolName.trim()) return;

    const lastPool = pools.length > 0 ? pools[pools.length - 1] : null;

    const newParticipants: Participant[] = lastPool
      ? lastPool.participants.map((p, index) => ({
          name: p.name,
          phone: p.phone,
          quotas: p.quotas,
          status: 'Pendente',
          id: `p-${new Date().getTime()}-${index}`, // Generate a new unique ID
      }))
      : [];

    const newPool: Pool = {
      id: new Date().toISOString(),
      name: newPoolName,
      participants: newParticipants,
      financialRecords: []
    };
    const newPools = [...pools, newPool];
    setPools(newPools);
    setSelectedPoolId(newPool.id);
    updateRemoteData(newPools);
    setShowCreatePoolModal(false);
    setNewPoolName('');
    showToast('Novo bolão criado com sucesso!', 'success');
    setActiveTab('participants');
  };

  const valorArrecadado = useMemo(() => {
    if (!selectedPool) return 0;
    return selectedPool.participants
      .filter(p => p.status === 'Pago')
      .reduce((sum, p) => sum + p.quotas * 20, 0);
  }, [selectedPool]);

  const renderContent = () => {
    if (activeTab === 'faq') {
      return <FaqTab />;
    }
    if (loading) return <div className="text-center p-10">Carregando dados...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (pools.length === 0) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold">Nenhum bolão encontrado.</h2>
          {isAdmin && <p className="mt-2">Clique em "Criar Novo Bolão" para começar.</p>}
        </div>
      );
    }
    if (!selectedPool) {
      return <div className="text-center p-10">Por favor, selecione um bolão para visualizar os dados.</div>;
    }
    return activeTab === 'participants' ? (
      <ParticipantsTab 
        participants={selectedPool.participants}
        isAdmin={isAdmin}
        onSave={handleSaveParticipant}
        onDelete={(id) => confirmDelete(id, 'participant')}
        editingParticipant={editingParticipant}
        setEditingParticipant={setEditingParticipant}
        onToggleStatus={handleToggleParticipantStatus}
      />
    ) : (
      <FinancialTab 
        records={selectedPool.financialRecords}
        isAdmin={isAdmin}
        onAdd={handleAddFinancialRecord}
        onDelete={(id) => confirmDelete(id, 'financial')}
        valorArrecadado={valorArrecadado}
      />
    );
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col">
      <Header isAdmin={isAdmin} onAdminClick={handleAdminClick} />

      <main className="container mx-auto p-4 sm:p-6 flex-grow">
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto sm:flex-1">
            <label htmlFor="pool-select" className="sr-only">Selecionar Bolão</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CollectionIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="pool-select"
                value={selectedPoolId || ''}
                onChange={e => setSelectedPoolId(e.target.value)}
                className="w-full pl-10 p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                disabled={pools.length === 0}
              >
                <option value="" disabled>Selecione um bolão</option>
                {pools.map(pool => (
                  <option key={pool.id} value={pool.id}>{pool.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreatePoolModal(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>Criar Novo Bolão</span>
            </button>
          )}
        </div>

        <div className="mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('participants')}
                disabled={pools.length === 0}
                className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex justify-center items-center space-x-2 ${
                  activeTab === 'participants' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : pools.length === 0 
                  ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <UserCircleIcon className="w-5 h-5"/>
                <span>Participantes</span>
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                disabled={pools.length === 0}
                className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex justify-center items-center space-x-2 ${
                  activeTab === 'financial' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : pools.length === 0 
                  ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ChartBarIcon className="w-5 h-5"/>
                <span>Financeiro</span>
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex justify-center items-center space-x-2 ${
                  activeTab === 'faq' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <QuestionMarkCircleIcon className="w-5 h-5"/>
                <span>FAQ</span>
              </button>
            </div>
          </div>

        {renderContent()}
      </main>

      {/* Admin Login Modal */}
      <Modal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} title="Acessar Modo Admin">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Digite a senha de administrador para gerenciar os dados.</p>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockClosedIcon className="h-5 w-5 text-gray-400" /></div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full pl-10 pr-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Digite a senha"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          <button onClick={handleAdminLogin} className="w-full bg-primary-500 text-white p-2 rounded-md hover:bg-primary-600">Entrar</button>
        </div>
      </Modal>

      {/* Create Pool Modal */}
      <Modal isOpen={showCreatePoolModal} onClose={() => setShowCreatePoolModal(false)} title="Criar Novo Bolão">
          <div className="space-y-4">
              <div>
                  <label htmlFor="pool-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Bolão</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="pool-name"
                        type="text"
                        value={newPoolName}
                        onChange={(e) => setNewPoolName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreatePool()}
                        className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ex: Agosto/2024"
                    />
                  </div>
              </div>
              <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowCreatePoolModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400">Cancelar</button>
                  <button onClick={handleCreatePool} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Criar</button>
              </div>
          </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Exclusão">
        <div className="space-y-4">
            <p>Você tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-2">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400">Cancelar</button>
                <button onClick={handleDeleteConfirmed} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Excluir</button>
            </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
};

export default App;

import React, { useState, useMemo, useEffect } from 'react';
import { Participant, FinancialRecord, Pool } from './types';
import Header from './components/Header';
import ParticipantsTab from './components/ParticipantsTab';
import FinancialTab from './components/FinancialTab';
import FaqTab from './components/FaqTab';
import GeneratorTab from './components/GeneratorTab';
import Modal from './components/Modal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { UserCircleIcon, ChartBarIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, PlusCircleIcon, CollectionIcon, TagIcon, QuestionMarkCircleIcon, ExclamationTriangleIcon, CalendarIcon, CurrencyDollarIcon, PencilIcon, TrashIcon, DocumentTextIcon, SparklesIcon, UsersIcon } from './components/icons';

type ActiveTab = 'participants' | 'financial' | 'generator' | 'faq';

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
  
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'participant' | 'financial'} | null>(null);

  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolStartDate, setNewPoolStartDate] = useState('');
  const [newPoolEndDate, setNewPoolEndDate] = useState('');
  const [newPoolQuotaValue, setNewPoolQuotaValue] = useState('20');
  const [newPoolStatus, setNewPoolStatus] = useState<'Em andamento' | 'Encerrado'>('Em andamento');
  const [newPoolBaseId, setNewPoolBaseId] = useState<string>('none');


  const [showEditPoolModal, setShowEditPoolModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [editPoolName, setEditPoolName] = useState('');
  const [editPoolStartDate, setEditPoolStartDate] = useState('');
  const [editPoolEndDate, setEditPoolEndDate] = useState('');
  const [editPoolQuotaValue, setEditPoolQuotaValue] = useState('');
  const [editPoolStatus, setEditPoolStatus] = useState<'Em andamento' | 'Encerrado'>('Em andamento');

  const [showDeletePoolConfirmModal, setShowDeletePoolConfirmModal] = useState(false);
  const [poolToDeleteId, setPoolToDeleteId] = useState<string | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showShareReportModal, setShowShareReportModal] = useState(false);


  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const visiblePools = useMemo(() => {
    if (isAdmin) {
      return pools;
    }
    return pools.filter(p => p.status === 'Em andamento');
  }, [pools, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(NPOINT_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const loadedPools: Pool[] = (data.pools || []).map((p: any) => ({
            ...p,
            status: p.status || 'Em andamento' // Backward compatibility
        }));

        setPools(loadedPools);
        
        const activePools = loadedPools.filter(p => p.status === 'Em andamento');

        if (loadedPools.length === 0) {
            setActiveTab('faq');
            setShowEntryModal(false);
        } else if (activePools.length > 1) {
            setShowEntryModal(true);
        } else if (activePools.length === 1) {
            setSelectedPoolId(activePools[0].id);
            setShowEntryModal(false);
        } else { // 0 active pools, but closed pools might exist
            setSelectedPoolId(null);
            setShowEntryModal(false);
        }
      } catch (e) {
        console.error("Failed to fetch data from npoint.io", e);
        setError("Não foi possível carregar os dados. Verifique sua conexão ou tente novamente.");
        showToast('Erro ao carregar os dados.', 'error');
        setShowEntryModal(false);
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
      if (!selectedPoolId && pools.length > 0) {
        setSelectedPoolId(pools[0].id);
      }
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  const selectedPool = useMemo(() => pools.find(p => p.id === selectedPoolId), [pools, selectedPoolId]);

  const handleAdminClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setEditingParticipant(null);
      showToast('Modo Admin desativado.', 'success');
      if (selectedPool && selectedPool.status === 'Encerrado') {
        const firstActivePool = pools.find(p => p.status === 'Em andamento');
        setSelectedPoolId(firstActivePool?.id || null);
      }
    } else {
      setShowAdminModal(true);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleSaveParticipant = (participantData: Omit<Participant, 'id'>, id?: string) => {
    if (!selectedPoolId || !selectedPool) return;

    const cleanPhoneNumber = (phone: string) => (phone || '').replace(/\D/g, '');
    const newPhoneCleaned = cleanPhoneNumber(participantData.phone);

    if (newPhoneCleaned) {
      const isDuplicate = selectedPool.participants.some(p => {
        // When editing, exclude the current participant from the duplicate check
        if (p.id === id) return false;
        return cleanPhoneNumber(p.phone) === newPhoneCleaned;
      });

      if (isDuplicate) {
        showToast('Este telefone já está cadastrado. Edite o participante existente para adicionar mais cotas.', 'error');
        return; // Stop execution
      }
    }

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
            // FIX: Explicitly define the type of the new status to prevent type widening to string.
            const newStatus: 'Pago' | 'Pendente' =
              p.status === 'Pago' ? 'Pendente' : 'Pago';
            return { ...p, status: newStatus };
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

  const confirmDeleteItem = (id: string, type: 'participant' | 'financial') => {
    setItemToDelete({ id, type });
    setShowDeleteItemModal(true);
  };

  const handleDeleteItemConfirmed = () => {
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
    setShowDeleteItemModal(false);
    setItemToDelete(null);
  };

  const handleCreatePool = () => {
    if (!newPoolName.trim() || !newPoolStartDate || !newPoolEndDate || !newPoolQuotaValue) {
        showToast('Preencha todos os campos para criar o bolão.', 'error');
        return;
    }

    let newParticipants: Participant[] = [];
  
    if (newPoolBaseId !== 'none') {
      const basePool = pools.find(p => p.id === newPoolBaseId);
      if (basePool) {
        newParticipants = basePool.participants.map((p, index) => ({
          name: p.name,
          phone: p.phone,
          quotas: p.quotas,
          status: 'Pendente',
          id: `p-${new Date().getTime()}-${index}`,
        }));
      } else {
         showToast('Bolão base não encontrado. Criando bolão vazio.', 'error');
      }
    }
  
    const newPool: Pool = {
      id: new Date().toISOString(),
      name: newPoolName,
      startDate: newPoolStartDate,
      endDate: newPoolEndDate,
      quotaValue: parseFloat(newPoolQuotaValue),
      status: newPoolStatus,
      participants: newParticipants,
      financialRecords: []
    };
  
    const newPools = [...pools, newPool];
    setPools(newPools);
    setSelectedPoolId(newPool.id);
    updateRemoteData(newPools);
    
    setShowCreatePoolModal(false);
    setNewPoolName('');
    setNewPoolStartDate('');
    setNewPoolEndDate('');
    setNewPoolQuotaValue('20');
    setNewPoolStatus('Em andamento');
    setNewPoolBaseId('none');
    showToast('Novo bolão criado com sucesso!', 'success');
    setActiveTab('participants');
  };

  const handleOpenEditPoolModal = () => {
    if (!selectedPool) return;
    setEditingPool(selectedPool);
    setEditPoolName(selectedPool.name);
    setEditPoolStartDate(selectedPool.startDate);
    setEditPoolEndDate(selectedPool.endDate);
    setEditPoolQuotaValue(String(selectedPool.quotaValue));
    setEditPoolStatus(selectedPool.status);
    setShowEditPoolModal(true);
  };

  const handleUpdatePool = () => {
    if (!editingPool) return;
    if (!editPoolName.trim() || !editPoolStartDate || !editPoolEndDate || !editPoolQuotaValue) {
        showToast('Preencha todos os campos para editar o bolão.', 'error');
        return;
    }
    const updatedPool: Pool = {
        ...editingPool,
        name: editPoolName,
        startDate: editPoolStartDate,
        endDate: editPoolEndDate,
        quotaValue: parseFloat(editPoolQuotaValue),
        status: editPoolStatus,
    };
    const newPools = pools.map(p => p.id === editingPool.id ? updatedPool : p);
    setPools(newPools);
    updateRemoteData(newPools);
    setShowEditPoolModal(false);
    setEditingPool(null);
    showToast('Bolão atualizado com sucesso!', 'success');
  };
  
  const handleOpenDeletePoolModal = () => {
    if (!selectedPoolId) return;
    setPoolToDeleteId(selectedPoolId);
    setShowDeletePoolConfirmModal(true);
  };

  const handleDeletePoolConfirmed = () => {
    if (!poolToDeleteId) return;
    const newPools = pools.filter(p => p.id !== poolToDeleteId);
    setPools(newPools);
    updateRemoteData(newPools);

    if (newPools.length > 0) {
        setSelectedPoolId(newPools[0].id);
    } else {
        setSelectedPoolId(null);
        setActiveTab('faq');
    }

    setShowDeletePoolConfirmModal(false);
    setPoolToDeleteId(null);
    showToast('Bolão excluído com sucesso.', 'success');
  };

  const valorArrecadado = useMemo(() => {
    if (!selectedPool) return 0;
    const quotaValue = selectedPool.quotaValue || 20; // Fallback para dados antigos
    return selectedPool.participants
      .filter(p => p.status === 'Pago')
      .reduce((sum, p) => sum + p.quotas * quotaValue, 0);
  }, [selectedPool]);

  const generatePdfDoc = (): any | null => {
    if (!selectedPool) {
        showToast('Selecione um bolão para gerar o relatório.', 'error');
        return null;
    }

    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();

    // --- Main Title ---
    doc.setFontSize(22);
    doc.setTextColor('#134E4A'); // primary-900
    doc.text("Bolão do Sebastião", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // --- Sub Title (Pool Name) ---
    doc.setFontSize(16);
    doc.setTextColor('#0D9488'); // primary-600
    doc.text(`Relatório do Bolão: ${selectedPool.name}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });


    // --- Summary ---
    doc.setFontSize(12);
    doc.setTextColor('#111827');
    doc.text('Resumo Geral', 14, 48);
    
    const totalApostas = selectedPool.financialRecords.filter(r => r.type === 'Aposta').reduce((sum, r) => sum + r.amount, 0);
    const totalPremiacoes = selectedPool.financialRecords.filter(r => r.type === 'Premiação').reduce((sum, r) => sum + r.amount, 0);
    const saldo = valorArrecadado - totalApostas + totalPremiacoes;

    const summaryData = [
      ['Período', `${selectedPool.startDate ? new Date(selectedPool.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'} a ${selectedPool.endDate ? new Date(selectedPool.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}`],
      ['Valor da Cota', (selectedPool.quotaValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Total Arrecadado (Pago)', valorArrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Total de Apostas (Saídas)', `- ${totalApostas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`],
      ['Total de Premiações (Ganhos)', `+ ${totalPremiacoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`],
      ['Saldo Final', saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ];

    (doc as any).autoTable({
        startY: 52,
        head: [['Item', 'Valor']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [13, 148, 136] }, // primary-600
    });

    let lastY = (doc as any).lastAutoTable.finalY + 15;

    // --- Financial Records Table ---
    if (selectedPool.financialRecords.length > 0) {
        doc.setFontSize(12);
        doc.text('Histórico Financeiro', 14, lastY);

        const financialBody = selectedPool.financialRecords
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(r => [
                new Date(r.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                r.type,
                r.description || '-',
                (r.type === 'Premiação' ? '+ ' : '- ') + r.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            ]);

        (doc as any).autoTable({
            startY: lastY + 4,
            head: [['Data', 'Tipo', 'Descrição', 'Valor']],
            body: financialBody,
            theme: 'striped',
            headStyles: { fillColor: [13, 148, 136] },
        });
        lastY = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // --- Participants Table ---
    doc.setFontSize(12);
    doc.text('Lista de Participantes', 14, lastY);
    
    const participantBody = selectedPool.participants
        .sort((a,b) => a.name.localeCompare(b.name))
        .map(p => [p.name, p.phone, p.quotas.toString(), p.status]);

    (doc as any).autoTable({
        startY: lastY + 4,
        head: [['Nome', 'Telefone', 'Cotas', 'Status']],
        body: participantBody,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] },
    });
    
    return doc;
  };

  const handleDownloadOnly = () => {
    const doc = generatePdfDoc();
    if (doc && selectedPool) {
      const fileName = `Relatorio_Bolao_${selectedPool.name.replace(/\W/g, '_')}.pdf`;
      doc.save(fileName);
      showToast('Relatório PDF baixado com sucesso!', 'success');
    }
    setShowShareReportModal(false);
  };

  const handleSendViaWhatsApp = () => {
    const doc = generatePdfDoc();
    if (!doc || !selectedPool) {
        setShowShareReportModal(false);
        return;
    }

    // First, download the file so the user has it locally
    const fileName = `Relatorio_Bolao_${selectedPool.name.replace(/\W/g, '_')}.pdf`;
    doc.save(fileName);
    showToast('PDF baixado! Abrindo WhatsApp...', 'success');

    // Then, prepare and open the WhatsApp link
    const message = `Olá! Segue o relatório do bolão "${selectedPool.name}". O arquivo PDF acabou de ser baixado no seu dispositivo, basta anexá-lo aqui na conversa.`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setShowShareReportModal(false);
  };

  const renderContent = () => {
    if (activeTab === 'generator') {
      return <GeneratorTab />;
    }
    if (activeTab === 'faq') {
      return <FaqTab />;
    }
    if (!selectedPool) {
        return null; // Should not be reached if layout is correct
    }
    return activeTab === 'participants' ? (
      <ParticipantsTab 
        participants={selectedPool.participants}
        isAdmin={isAdmin}
        onSave={handleSaveParticipant}
        onDelete={(id) => confirmDeleteItem(id, 'participant')}
        editingParticipant={editingParticipant}
        setEditingParticipant={setEditingParticipant}
        onToggleStatus={handleToggleParticipantStatus}
      />
    ) : (
      <FinancialTab 
        records={selectedPool.financialRecords}
        isAdmin={isAdmin}
        onAdd={handleAddFinancialRecord}
        onDelete={(id) => confirmDeleteItem(id, 'financial')}
        valorArrecadado={valorArrecadado}
      />
    );
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col">
      <Header isAdmin={isAdmin} onAdminClick={handleAdminClick} />

      <main className="container mx-auto p-4 sm:p-6 flex-grow">
        {loading ? (
           <div className="text-center p-10">Carregando dados...</div>
        ) : error ? (
           <div className="text-center p-10 text-red-500">{error}</div>
        ) : (
          <>
            {visiblePools.length > 0 && (
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
                      disabled={visiblePools.length === 0}
                    >
                      <option value="" disabled>Selecione um bolão</option>
                      {visiblePools.map(pool => (
                        <option key={pool.id} value={pool.id}>{pool.name} - ({pool.status})</option>
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
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                      <button
                          onClick={() => setShowShareReportModal(true)}
                          disabled={!selectedPoolId}
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white font-semibold rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                          <DocumentTextIcon className="w-5 h-5" />
                          <span>Relatório</span>
                      </button>
                      <button
                          onClick={handleOpenEditPoolModal}
                          disabled={!selectedPoolId}
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                          <PencilIcon className="w-5 h-5" />
                          <span>Editar</span>
                      </button>
                      <button
                          onClick={handleOpenDeletePoolModal}
                          disabled={!selectedPoolId}
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                          <TrashIcon className="w-5 h-5" />
                          <span>Excluir</span>
                      </button>
                      <button
                        onClick={() => setShowCreatePoolModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Criar Novo</span>
                      </button>
                  </div>
                )}
              </div>
            )}
            
            {selectedPool ? (
              <>
                <div className="bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-r-lg shadow mb-6" role="alert">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-x-4 gap-y-2">
                    <div className="text-center text-sm text-yellow-800 dark:text-yellow-200 space-y-2 md:space-y-0 md:flex md:items-center md:gap-x-4">
                      <p className="font-medium">Proibido para menores de 18 anos 🔞</p>
                      <p className="hidden md:block text-yellow-600 dark:text-yellow-400" aria-hidden="true">&bull;</p>
                      <p className="font-medium">Importante: Só participe se os {(selectedPool?.quotaValue || 20).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} não forem lhe fazer falta!</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Data de Início</h4>
                        <p className="text-md font-bold text-primary-600 dark:text-primary-400">{selectedPool.startDate ? new Date(selectedPool.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Data de Término</h4>
                        <p className="text-md font-bold text-primary-600 dark:text-primary-400">{selectedPool.endDate ? new Date(selectedPool.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Valor da Cota</h4>
                        <p className="text-md font-bold text-primary-600 dark:text-primary-400">
                            {(selectedPool.quotaValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Arrecadado (Pago)</h4>
                        <p className="text-md font-bold text-green-600">{valorArrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
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
                      {isAdmin && (
                        <button
                          onClick={() => setActiveTab('generator')}
                          className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex justify-center items-center space-x-2 ${
                            activeTab === 'generator' 
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                          <SparklesIcon className="w-5 h-5"/>
                          <span>Gerador IA</span>
                        </button>
                      )}
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
              </>
            ) : (
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {isAdmin ? (pools.length > 0 ? "Selecione um bolão para começar." : "Nenhum bolão encontrado.") : "Nenhum bolão em andamento disponível."}
                    </h2>
                    {isAdmin && pools.length === 0 && (
                      <div className="mt-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Crie o primeiro bolão para iniciar o gerenciamento.</p>
                        <button
                          onClick={() => setShowCreatePoolModal(true)}
                          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                        >
                          <PlusCircleIcon className="w-5 h-5" />
                          <span>Criar Novo Bolão</span>
                        </button>
                      </div>
                    )}
                    {!isAdmin && (
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Verifique novamente mais tarde ou entre em contato com o administrador.</p>
                    )}
                </div>
            )}
          </>
        )}
      </main>

      {/* Entry Modal */}
      <Modal isOpen={showEntryModal && !loading} onClose={() => {}} title="Bem-vindo! Selecione um bolão para acessar">
          <div className="space-y-3">
              {pools.filter(p => p.status === 'Em andamento').length > 0 ? (
                  pools
                      .filter(pool => pool.status === 'Em andamento')
                      .map(pool => (
                      <button
                          key={pool.id}
                          onClick={() => {
                              setSelectedPoolId(pool.id);
                              setShowEntryModal(false);
                          }}
                          className="w-full text-center p-4 rounded-lg transition-colors bg-primary-50 hover:bg-primary-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                          <span className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{pool.name}</span>
                      </button>
                  ))
              ) : (
                  <p className="text-center text-gray-600 dark:text-gray-400">Nenhum bolão em andamento disponível no momento.</p>
              )}
          </div>
      </Modal>

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
      <Modal isOpen={showCreatePoolModal} onClose={() => { setShowCreatePoolModal(false); setNewPoolBaseId('none'); }} title="Criar Novo Bolão">
          <div className="space-y-4">
              <div>
                  <label htmlFor="pool-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Bolão</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></div>
                    <input id="pool-name" type="text" value={newPoolName} onChange={(e) => setNewPoolName(e.target.value.toUpperCase())} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500 uppercase" placeholder="Ex: Agosto/2024" required />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Início</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></div>
                      <input id="start-date" type="date" value={newPoolStartDate} onChange={(e) => setNewPoolStartDate(e.target.value)} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Término</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></div>
                      <input id="end-date" type="date" value={newPoolEndDate} onChange={(e) => setNewPoolEndDate(e.target.value)} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="quota-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Cota (R$)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyDollarIcon className="h-5 w-5 text-gray-400" /></div>
                      <input id="quota-value" type="number" step="0.01" min="0" value={newPoolQuotaValue} onChange={(e) => setNewPoolQuotaValue(e.target.value)} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500" placeholder="20.00" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="pool-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select id="pool-status" value={newPoolStatus} onChange={e => setNewPoolStatus(e.target.value as 'Em andamento' | 'Encerrado')} className="w-full p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500">
                        <option value="Em andamento">Em andamento</option>
                        <option value="Encerrado">Encerrado</option>
                    </select>
                </div>
              </div>
               <div>
                  <label htmlFor="pool-base" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Importar Participantes de (Opcional)
                  </label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UsersIcon className="h-5 w-5 text-gray-400" /></div>
                      <select 
                          id="pool-base" 
                          value={newPoolBaseId} 
                          onChange={e => setNewPoolBaseId(e.target.value)} 
                          className="w-full pl-10 p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                          disabled={pools.length === 0}
                      >
                          <option value="none">Criar bolão em branco</option>
                          {pools.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(pool => (
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
              <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => { setShowCreatePoolModal(false); setNewPoolBaseId('none'); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400">Cancelar</button>
                  <button onClick={handleCreatePool} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Criar</button>
              </div>
          </div>
      </Modal>

      {/* Edit Pool Modal */}
      <Modal isOpen={showEditPoolModal} onClose={() => setShowEditPoolModal(false)} title="Editar Bolão">
        <div className="space-y-4">
            <div>
                <label htmlFor="edit-pool-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Bolão</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></div>
                    <input id="edit-pool-name" type="text" value={editPoolName} onChange={(e) => setEditPoolName(e.target.value.toUpperCase())} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500 uppercase" placeholder="Ex: Agosto/2024" required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Início</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></div>
                        <input id="edit-start-date" type="date" value={editPoolStartDate} onChange={(e) => setEditPoolStartDate(e.target.value)} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="edit-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Término</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></div>
                        <input id="edit-end-date" type="date" value={editPoolEndDate} onChange={(e) => setEditPoolEndDate(e.target.value)} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-quota-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Cota (R$)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyDollarIcon className="h-5 w-5 text-gray-400" /></div>
                        <input id="edit-quota-value" type="number" step="0.01" min="0" value={editPoolQuotaValue} onChange={(e) => setEditPoolQuotaValue(e.target.value)} className="w-full pl-10 p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500" placeholder="20.00" required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="edit-pool-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select id="edit-pool-status" value={editPoolStatus} onChange={e => setEditPoolStatus(e.target.value as 'Em andamento' | 'Encerrado')} className="w-full p-2 border rounded-md bg-white text-gray-900 border-gray-300 focus:ring-primary-500 focus:border-primary-500">
                        <option value="Em andamento">Em andamento</option>
                        <option value="Encerrado">Encerrado</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => setShowEditPoolModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400">Cancelar</button>
                <button onClick={handleUpdatePool} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Salvar Alterações</button>
            </div>
        </div>
    </Modal>

    {/* Delete Pool Confirmation Modal */}
    <Modal isOpen={showDeletePoolConfirmModal} onClose={() => setShowDeletePoolConfirmModal(false)} title="Confirmar Exclusão do Bolão">
        <div className="space-y-4">
            <p>Você tem certeza que deseja excluir este bolão? <strong>Todos os participantes e registros financeiros associados serão perdidos.</strong> Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-2">
                <button onClick={() => setShowDeletePoolConfirmModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400">Cancelar</button>
                <button onClick={handleDeletePoolConfirmed} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Excluir Bolão</button>
            </div>
        </div>
    </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal isOpen={showDeleteItemModal} onClose={() => setShowDeleteItemModal(false)} title="Confirmar Exclusão">
        <div className="space-y-4">
            <p>Você tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-2">
                <button onClick={() => setShowDeleteItemModal(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400">Cancelar</button>
                <button onClick={handleDeleteItemConfirmed} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Excluir</button>
            </div>
        </div>
      </Modal>

      {/* Share Report Modal */}
      <Modal isOpen={showShareReportModal} onClose={() => setShowShareReportModal(false)} title="Gerar e Enviar Relatório">
          <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">O relatório será baixado no seu dispositivo. Após o download, você pode enviá-lo pelo WhatsApp.</p>
              <div className="flex flex-col space-y-2 pt-2">
                  <button 
                      onClick={handleSendViaWhatsApp} 
                      className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                  >
                      Baixar e Enviar por WhatsApp
                  </button>
                  <button 
                      onClick={handleDownloadOnly} 
                      className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
                  >
                      Apenas Baixar o PDF
                  </button>
              </div>
          </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
};

export default App;

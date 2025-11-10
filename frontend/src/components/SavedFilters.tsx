import { useState, useEffect } from 'react';

interface Filter {
  id: string;
  name: string;
  status: string;
  searchQuery: string;
  period: string;
}

interface SavedFiltersProps {
  onApplyFilter: (filter: Omit<Filter, 'id' | 'name'>) => void;
  currentStatus: string;
  currentSearch: string;
  currentPeriod: string;
}

export default function SavedFilters({
  onApplyFilter,
  currentStatus,
  currentSearch,
  currentPeriod,
}: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<Filter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Carrega filtros do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Salva no localStorage quando muda
  const saveToLocalStorage = (filters: Filter[]) => {
    localStorage.setItem('savedFilters', JSON.stringify(filters));
    setSavedFilters(filters);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      alert('Digite um nome para o filtro');
      return;
    }

    const newFilter: Filter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      status: currentStatus,
      searchQuery: currentSearch,
      period: currentPeriod,
    };

    const updated = [...savedFilters, newFilter];
    saveToLocalStorage(updated);
    setFilterName('');
    setShowSaveDialog(false);
  };

  const handleDeleteFilter = (id: string) => {
    if (!confirm('Deseja deletar este filtro salvo?')) return;

    const updated = savedFilters.filter((f) => f.id !== id);
    saveToLocalStorage(updated);
  };

  const handleApplyFilter = (filter: Filter) => {
    onApplyFilter({
      status: filter.status,
      searchQuery: filter.searchQuery,
      period: filter.period,
    });
    setShowDropdown(false);
  };

  return (
    <div className="saved-filters-container">
      <div className="saved-filters-actions">
        <button className="btn-secondary" onClick={() => setShowDropdown(!showDropdown)}>
          ⭐ Filtros Salvos {savedFilters.length > 0 && `(${savedFilters.length})`}
        </button>
        <button className="btn-secondary" onClick={() => setShowSaveDialog(!showSaveDialog)}>
          💾 Salvar Filtro Atual
        </button>
      </div>

      {/* Dropdown de filtros */}
      {showDropdown && (
        <div className="filters-dropdown">
          {savedFilters.length === 0 ? (
            <div className="empty-filters">Nenhum filtro salvo ainda</div>
          ) : (
            savedFilters.map((filter) => (
              <div key={filter.id} className="filter-item">
                <button className="filter-apply-btn" onClick={() => handleApplyFilter(filter)}>
                  <strong>{filter.name}</strong>
                  <div className="filter-details">
                    {filter.period} • {filter.status !== 'all' ? filter.status : 'Todos'}
                    {filter.searchQuery && ` • "${filter.searchQuery}"`}
                  </div>
                </button>
                <button
                  className="filter-delete-btn"
                  onClick={() => handleDeleteFilter(filter.id)}
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dialog de salvar */}
      {showSaveDialog && (
        <div className="save-dialog">
          <input
            type="text"
            className="filter-name-input"
            placeholder="Nome do filtro (ex: Falhas de Hoje)"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
            autoFocus
          />
          <div className="save-preview">
            Salvando: {currentPeriod} • {currentStatus !== 'all' ? currentStatus : 'Todos'}
            {currentSearch && ` • "${currentSearch}"`}
          </div>
          <div className="dialog-actions">
            <button className="btn-primary" onClick={handleSaveFilter}>
              Salvar
            </button>
            <button className="btn-secondary" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

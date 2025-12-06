// components/shared/Pagination.js
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) => {
  // Calcola l'indice di inizio e fine degli elementi visualizzati
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Genera i numeri di pagina da mostrare
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Numero massimo di pagine da mostrare

    if (totalPages <= maxPagesToShow) {
      // Mostra tutte le pagine se sono poche
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logica per mostrare pagine con ellipsis
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 1;

      if (!showLeftDots && showRightDots) {
        // Mostra prime pagine + dots + ultima
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        // Mostra prima + dots + ultime pagine
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else if (showLeftDots && showRightDots) {
        // Mostra prima + dots + corrente con siblings + dots + ultima
        pages.push(1);
        pages.push('...');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Se non ci sono elementi o solo una pagina, non mostrare la paginazione
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  return (
    <div className="glass-pagination-container p-4 rounded-2xl">
      <div className="flex items-center justify-between">
        {/* Info elementi visualizzati */}
        <div className="text-sm text-white/70">
          Mostrando <span className="text-white font-medium">{startIndex}</span> - <span className="text-white font-medium">{endIndex}</span> di <span className="text-white font-medium">{totalItems}</span> elementi
        </div>

        {/* Controlli paginazione */}
        <div className="flex items-center space-x-2">
          {/* Prima pagina */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="glass-pagination-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Prima pagina"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Pagina precedente */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="glass-pagination-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Pagina precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numeri di pagina */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`dots-${index}`} className="px-2 text-white/50">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`glass-pagination-number px-3 py-1.5 rounded-xl transition-all duration-300 ${
                    currentPage === page
                      ? 'glass-pagination-active text-white font-semibold'
                      : 'text-white/70 hover:text-white hover:scale-105'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Pagina successiva */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="glass-pagination-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Pagina successiva"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Ultima pagina */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="glass-pagination-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Ultima pagina"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stili CSS */}
      <style jsx>{`
        .glass-pagination-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .glass-pagination-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-pagination-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .glass-pagination-number {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 36px;
          text-align: center;
        }

        .glass-pagination-number:hover {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .glass-pagination-active {
          background: rgba(59, 130, 246, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
        }

        .glass-pagination-active:hover {
          background: rgba(59, 130, 246, 0.4);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .glass-pagination-container {
            padding: 0.75rem;
          }

          .glass-pagination-container > div {
            flex-direction: column;
            gap: 1rem;
          }

          .text-sm {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;

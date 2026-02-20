import { useState, useEffect } from 'react';
import { supabase, TableReservation } from './lib/supabase';
import ReservationPage from './pages/ReservationPage';
import ManagementPage from './pages/ManagementPage';
import BlacklistPage from './pages/BlacklistPage';
import HistoryPage from './pages/HistoryPage';
import PalletAcceptancePage from './pages/PalletAcceptancePage';
import LoadersPage from './pages/LoadersPage';
import PalletHistoryPage from './pages/PalletHistoryPage';
import ManageLoadersPage from './pages/ManageLoadersPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'reservation' | 'management' | 'blacklist' | 'history' | 'acceptance' | 'loaders' | 'pallet-history' | 'manage-loaders'>('reservation');
  const [reservations, setReservations] = useState<TableReservation[]>([]);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('table_reservations')
      .select('*')
      .order('table_number');

    if (error) {
      console.error('Error fetching reservations:', error);
    } else {
      setReservations(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white text-2xl animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <header className="relative bg-blue-700 bg-opacity-50 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-white text-2xl font-bold">Админка*</h1>
            <nav className="flex gap-6 text-sm text-white">
              <button
                onClick={() => setCurrentPage('management')}
                className={`transition-colors ${
                  currentPage === 'management'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                Управление столами
              </button>
              <button className="hover:text-blue-200 transition-colors">Модуль</button>
              <button
                onClick={() => setCurrentPage('blacklist')}
                className={`transition-colors ${
                  currentPage === 'blacklist'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                Черный список
              </button>
              <button
                onClick={() => setCurrentPage('manage-loaders')}
                className={`transition-colors ${
                  currentPage === 'manage-loaders'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                Управление грузчиками
              </button>
              <button
                onClick={() => setCurrentPage('acceptance')}
                className={`transition-colors ${
                  currentPage === 'acceptance'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                Приёмка
              </button>
              <button
                onClick={() => setCurrentPage('loaders')}
                className={`transition-colors ${
                  currentPage === 'loaders'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                Грузчики
              </button>
              <button
                onClick={() => setCurrentPage('reservation')}
                className={`transition-colors ${
                  currentPage === 'reservation'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                Запись за стол
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`transition-colors ${
                  currentPage === 'history'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                История столов
              </button>
              <button
                onClick={() => setCurrentPage('pallet-history')}
                className={`transition-colors ${
                  currentPage === 'pallet-history'
                    ? 'bg-white bg-opacity-20 px-4 py-2 rounded'
                    : 'hover:text-blue-200'
                }`}
              >
                История заказов
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-12">
        {currentPage === 'reservation' && (
          <ReservationPage reservations={reservations} onRefresh={fetchReservations} />
        )}
        {currentPage === 'management' && (
          <ManagementPage reservations={reservations} onRefresh={fetchReservations} />
        )}
        {currentPage === 'blacklist' && (
          <BlacklistPage onRefresh={fetchReservations} />
        )}
        {currentPage === 'history' && (
          <HistoryPage />
        )}
        {currentPage === 'acceptance' && (
          <PalletAcceptancePage reservations={reservations} onRefresh={fetchReservations} />
        )}
        {currentPage === 'loaders' && (
          <LoadersPage />
        )}
        {currentPage === 'pallet-history' && (
          <PalletHistoryPage />
        )}
        {currentPage === 'manage-loaders' && (
          <ManageLoadersPage />
        )}
      </main>
    </div>
  );
}

export default App;

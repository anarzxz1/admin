import { useState, useEffect } from 'react';
import { supabase, TableReservation, BlacklistEntry } from '../lib/supabase';

interface ReservationPageProps {
  reservations: TableReservation[];
  onRefresh: () => void;
}

function ReservationPage({ reservations, onRefresh }: ReservationPageProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const TOTAL_TABLES = 208;

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    const { data, error } = await supabase
      .from('blacklist')
      .select('badge_number, comment');

    if (error) {
      console.error('Error fetching blacklist:', error);
    } else {
      setBlacklist(data || []);
    }
  };

  const getReservedTableNumbers = () => {
    return new Set(reservations.map(r => r.table_number));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > TOTAL_TABLES) {
      setMessage('Пожалуйста, введите номер стола от 1 до 208');
      return;
    }

    if (!badgeNumber.trim()) {
      setMessage('Пожалуйста, введите номер бейджика');
      return;
    }

    const blacklistEntry = blacklist.find(
      (entry) => entry.badge_number === badgeNumber.trim()
    );

    if (blacklistEntry) {
      setMessage(`Бейджик в черном списке: ${blacklistEntry.comment || 'без комментария'}`);
      return;
    }

    // Проверяем, есть ли уже активная запись для этого бейджика
    const existingReservation = reservations.find(
      (res) => res.badge_number === badgeNumber.trim()
    );

    if (existingReservation) {
      setMessage(`Этот бейджик уже записан за стол № ${existingReservation.table_number}. Сначала открепите его от стола.`);
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('table_reservations')
      .insert([{ table_number: tableNum, badge_number: badgeNumber.trim() }]);

    if (error) {
      if (error.code === '23505') {
        setMessage('Этот стол уже занят');
      } else {
        setMessage('Ошибка при записи');
      }
    } else {
      setMessage('Стол успешно забронирован!');
      setTableNumber('');
      setBadgeNumber('');
      onRefresh();
    }

    setLoading(false);
  };

  const reservedTables = getReservedTableNumbers();
  const allTables: { number: number; status: 'available' | 'reserved' }[] = [];

  for (let i = 1; i <= TOTAL_TABLES; i++) {
    allTables.push({
      number: i,
      status: reservedTables.has(i) ? 'reserved' : 'available',
    });
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Запись за стол</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Номер стола"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Номер бейджика"
          value={badgeNumber}
          onChange={(e) => setBadgeNumber(e.target.value)}
          className="w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Загрузка...' : 'Записаться'}
        </button>
      </form>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('успешно') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold text-blue-900 text-center mb-6">
          Столы ({allTables.length})
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
          {allTables.map((table) => (
            <button
              key={table.number}
              onClick={() => table.status === 'available' && setTableNumber(table.number.toString())}
              disabled={table.status === 'reserved'}
              className={`font-semibold py-3 px-2 rounded-lg text-sm transition-colors ${
                table.status === 'available'
                  ? 'border-2 border-green-600 text-green-700 hover:bg-green-50 cursor-pointer'
                  : 'border-2 border-red-600 text-red-700 bg-red-50 cursor-not-allowed'
              }`}
            >
              № {table.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReservationPage;

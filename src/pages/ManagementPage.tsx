import { useState } from 'react';
import { supabase, TableReservation } from '../lib/supabase';

interface ManagementPageProps {
  reservations: TableReservation[];
  onRefresh: () => void;
}

function ManagementPage({ reservations, onRefresh }: ManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const getWorkingTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (diffHours === 0) {
      return `${mins} мин`;
    }
    return `${diffHours}ч ${mins}мин`;
  };

  const filteredReservations = reservations.filter((res) => {
    const query = searchQuery.toLowerCase();
    return (
      res.table_number.toString().includes(query) || res.badge_number.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (reservation: TableReservation) => {
    setDeleting(reservation.id);

    const { error: insertError } = await supabase
      .from('table_history')
      .insert([{
        table_number: reservation.table_number,
        badge_number: reservation.badge_number,
        started_at: reservation.created_at,
        completed_at: new Date().toISOString(),
      }]);

    if (insertError) {
      console.error('Error saving to history:', insertError);
      setDeleting(null);
      return;
    }

    const { error: deleteError } = await supabase
      .from('table_reservations')
      .delete()
      .eq('id', reservation.id);

    if (deleteError) {
      console.error('Error deleting reservation:', deleteError);
    } else {
      onRefresh();
    }
    setDeleting(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Управление столами</h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Поиск по номеру стола или бейджику..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Найти
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Номер стола</p>
                <p className="text-2xl font-bold text-blue-900">№ {reservation.table_number}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Бейджик</p>
                <p className="text-lg font-semibold text-gray-800">{reservation.badge_number}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Время создания</p>
                <p className="text-lg text-gray-800">
                  {new Date(reservation.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Время в работе</p>
                <p className="text-lg font-semibold text-green-600">
                  {getWorkingTime(reservation.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(reservation)}
                disabled={deleting === reservation.id}
                className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === reservation.id ? 'Открепление...' : 'Открепить'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'Столы не найдены' : 'Нет зарегистрированных столов'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ManagementPage;

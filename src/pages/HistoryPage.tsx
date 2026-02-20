import { useState, useEffect } from 'react';
import { supabase, TableHistory } from '../lib/supabase';
import { Search } from 'lucide-react';

function HistoryPage() {
  const [history, setHistory] = useState<TableHistory[]>([]);
  const [searchTable, setSearchTable] = useState('');
  const [searchBadge, setSearchBadge] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('table_history')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const filteredHistory = history.filter((record) => {
    const tableMatch = searchTable === '' || record.table_number.toString().includes(searchTable);
    const badgeMatch = searchBadge === '' || record.badge_number.toLowerCase().includes(searchBadge.toLowerCase());
    return tableMatch && badgeMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const calculateDuration = (startedAt: string, completedAt: string) => {
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">История столов</h2>

      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по столу"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по бейджику"
              value={searchBadge}
              onChange={(e) => setSearchBadge(e.target.value)}
              className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-gray-500 text-lg">Загрузка...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-gray-500 text-lg">История не найдена</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-blue-50">
                <th className="px-6 py-4 text-left text-lg font-semibold text-blue-900">Стол</th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-blue-900">Бейджик</th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-blue-900">Дата начала</th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-blue-900">Дата завершения</th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-blue-900">Длительность</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record, index) => (
                <tr
                  key={record.id}
                  className={`border-b border-gray-200 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-blue-100`}
                >
                  <td className="px-6 py-4 text-lg font-semibold text-blue-600">№ {record.table_number}</td>
                  <td className="px-6 py-4 text-lg text-gray-800">{record.badge_number}</td>
                  <td className="px-6 py-4 text-lg text-gray-800">{formatDate(record.started_at)}</td>
                  <td className="px-6 py-4 text-lg text-gray-800">{formatDate(record.completed_at)}</td>
                  <td className="px-6 py-4 text-lg font-semibold text-gray-700">
                    {calculateDuration(record.started_at, record.completed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-center text-gray-600">
        <p className="text-lg">Всего записей: {filteredHistory.length}</p>
      </div>
    </div>
  );
}

export default HistoryPage;

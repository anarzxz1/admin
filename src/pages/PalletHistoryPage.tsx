import { useState, useEffect } from 'react';
import { supabase, PalletOrder } from '../lib/supabase';

function PalletHistoryPage() {
  const [history, setHistory] = useState<PalletOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pallet_orders')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching pallet history:', error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const getExecutionTime = (createdAt: string, completedAt: string | null) => {
    if (!completedAt) return '-';
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    const diffMs = completed.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins === 0) {
      return `${diffSecs}с`;
    }
    return `${diffMins}м ${diffSecs}с`;
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">История заказов</h2>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Загрузка...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Нет выполненных заказов</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Номер стола</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Бейджик</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Время создания</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Время выполнения</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Время исполнения</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-lg font-semibold text-blue-600">№ {order.table_number}</td>
                  <td className="px-6 py-4 text-gray-800">{order.badge_number}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(order.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {order.completed_at ? new Date(order.completed_at).toLocaleString('ru-RU') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg font-semibold text-sm">
                      {getExecutionTime(order.created_at, order.completed_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PalletHistoryPage;

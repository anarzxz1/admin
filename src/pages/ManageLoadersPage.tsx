import { useState, useEffect } from 'react';
import { supabase, PalletOrder } from '../lib/supabase';

function ManageLoadersPage() {
  const [orders, setOrders] = useState<PalletOrder[]>([]);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(fetchAllOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllOrders = async () => {
    const { data, error } = await supabase
      .from('pallet_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pallet orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const handleComplete = async (orderId: string) => {
    setCompletingId(orderId);

    const { error } = await supabase
      .from('pallet_orders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error completing order:', error);
    } else {
      fetchAllOrders();
    }

    setCompletingId(null);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Управление грузчиками</h2>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Активные заказы
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          История
        </button>
      </div>

      {activeTab === 'active' && (
        <div>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Нет активных заказов.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Активные заказы ({pendingOrders.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Стол</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Бейджик</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Дата создания заказа</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-lg font-semibold text-gray-600">№ {order.table_number}</td>
                        <td className="px-6 py-4 text-gray-700">{order.badge_number}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(order.created_at).toLocaleString('ru-RU')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleComplete(order.id)}
                            disabled={completingId === order.id}
                            className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {completingId === order.id ? 'Обработка...' : 'ОК'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {completedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Нет истории заказов</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">История заказов ({completedOrders.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Стол</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Бейджик</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Дата заказа</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Время выполнения</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {completedOrders.map((order) => (
                      <tr key={order.id} className="opacity-75">
                        <td className="px-6 py-4 text-lg font-semibold text-gray-600">№ {order.table_number}</td>
                        <td className="px-6 py-4 text-gray-700">{order.badge_number}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(order.created_at).toLocaleString('ru-RU')}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {order.completed_at ? new Date(order.completed_at).toLocaleString('ru-RU') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ManageLoadersPage;

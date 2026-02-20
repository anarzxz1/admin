import { useState, useEffect, useRef } from 'react';
import { supabase, PalletOrder } from '../lib/supabase';

function LoadersPage() {
  const [orders, setOrders] = useState<PalletOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<PalletOrder[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const processingOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetchPendingOrders();
    if (activeTab === 'history') {
      fetchCompletedOrders();
    }
    const interval = setInterval(() => {
      fetchPendingOrders();
      if (activeTab === 'history') {
        fetchCompletedOrders();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && processingOrderIdRef.current) {
      // Когда таймер дошел до 0, завершаем заказ
      completeOrder(processingOrderIdRef.current);
    }
  }, [countdown]);

  const fetchPendingOrders = async () => {
    const { data, error } = await supabase
      .from('pallet_orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at');

    if (error) {
      console.error('Error fetching pallet orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const fetchCompletedOrders = async () => {
    const { data, error } = await supabase
      .from('pallet_orders')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching completed orders:', error);
    } else {
      setCompletedOrders(data || []);
    }
  };

  const completeOrder = async (orderId: string) => {
    const { error: updateError } = await supabase
      .from('pallet_orders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error completing order:', updateError);
    } else {
      fetchPendingOrders();
    }

    setProcessing(null);
    setCountdown(0);
    processingOrderIdRef.current = null;
  };

  const handleOk = (orderId: string) => {
    setProcessing(orderId);
    processingOrderIdRef.current = orderId;
    setCountdown(3);
  };

  const currentOrder = orders[0];
  const processingOrder = processing ? orders.find(o => o.id === processing) : null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Грузчики</h2>

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
          onClick={() => {
            setActiveTab('history');
            fetchCompletedOrders();
          }}
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
        <>
          {processing && countdown > 0 && processingOrder && (
        <div className="mb-8 p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-300">
          <div className="text-center">
            <p className="text-9xl font-bold text-green-600 mb-8">{processingOrder.table_number}</p>
            <p className="text-5xl font-bold text-blue-600">{countdown}</p>
          </div>
        </div>
      )}

      {!processing && currentOrder && (
        <div className="mb-8 p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-300">
          <div className="text-center">
            <p className="text-9xl font-bold text-green-600 mb-8">{currentOrder.table_number}</p>
            <button
              onClick={() => handleOk(currentOrder.id)}
              disabled={processing !== null}
              className="w-full bg-green-600 text-white py-4 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ОК
            </button>
          </div>
        </div>
      )}

      {!processing && !currentOrder && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">Нет активных заказов.</p>
        </div>
      )}

          {!processing && !currentOrder && orders.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Следующие заказы ({orders.length})</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-800">Стол № {order.table_number}</p>
                        <p className="text-sm text-gray-600">{order.badge_number}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div>
          {completedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">Нет выполненных заказов</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Последние 10 выполненных заказов</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Стол</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Бейджик</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Дата создания</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Время выполнения</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {completedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
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

export default LoadersPage;

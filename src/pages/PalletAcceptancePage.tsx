import { useState, useEffect } from 'react';
import { supabase, TableReservation } from '../lib/supabase';

interface PalletAcceptancePageProps {
  reservations: TableReservation[];
  onRefresh: () => void;
}

function PalletAcceptancePage({ reservations, onRefresh }: PalletAcceptancePageProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 208) {
      setMessage('Пожалуйста, введите номер стола от 1 до 208');
      return;
    }

    if (!badgeNumber.trim()) {
      setMessage('Пожалуйста, введите номер бейджика');
      return;
    }

    const isRegistered = reservations.some(
      (res) => res.table_number === tableNum && res.badge_number === badgeNumber.trim()
    );

    if (!isRegistered) {
      setMessage('Запишитесь за стол');
      return;
    }

    setLoading(true);

    // Проверяем, есть ли уже активный заказ для этого стола
    const { data: existingOrders, error: checkError } = await supabase
      .from('pallet_orders')
      .select('id')
      .eq('table_number', tableNum)
      .eq('status', 'pending');

    if (checkError) {
      setMessage('Ошибка при проверке заказов');
      console.error('Error checking existing orders:', checkError);
      setLoading(false);
      return;
    }

    if (existingOrders && existingOrders.length > 0) {
      setMessage('Для этого стола уже есть активный заказ');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('pallet_orders')
      .insert([{
        table_number: tableNum,
        badge_number: badgeNumber.trim(),
        status: 'pending'
      }]);

    if (error) {
      setMessage('Ошибка при создании заказа');
      console.error('Error creating pallet order:', error);
    } else {
      setMessage('Палет уже в пути');
      setTableNumber('');
      setBadgeNumber('');
      onRefresh();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Приёмка</h2>

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
          {loading ? 'Загрузка...' : 'Заказать палет'}
        </button>
      </form>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-center text-lg font-semibold ${
            message.includes('пути') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default PalletAcceptancePage;

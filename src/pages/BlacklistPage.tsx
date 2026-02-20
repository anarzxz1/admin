import { useState, useEffect } from 'react';
import { supabase, BlacklistEntry } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface BlacklistPageProps {
  onRefresh: () => void;
}

function BlacklistPage({ onRefresh }: BlacklistPageProps) {
  const [badgeNumber, setBadgeNumber] = useState('');
  const [comment, setComment] = useState('');
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    const { data, error } = await supabase
      .from('blacklist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blacklist:', error);
    } else {
      setBlacklist(data || []);
    }
  };

  const handleAddToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!badgeNumber.trim()) {
      setMessage('Пожалуйста, введите номер бейджика');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('blacklist')
        .insert([{ badge_number: badgeNumber.trim(), comment: comment.trim() }]);

      if (insertError) {
        if (insertError.code === '23505') {
          setMessage('Этот бейджик уже в черном списке');
        } else {
          setMessage('Ошибка при добавлении в черный список');
        }
      } else {
        const { error: deleteError } = await supabase
          .from('table_reservations')
          .delete()
          .eq('badge_number', badgeNumber.trim());

        if (deleteError) {
          console.error('Error deleting reservations:', deleteError);
        }

        setMessage('Бейджик добавлен в черный список');
        setBadgeNumber('');
        setComment('');
        fetchBlacklist();
        onRefresh();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Ошибка при обработке');
    }

    setLoading(false);
  };

  const handleRemoveFromBlacklist = async (id: string) => {
    const { error } = await supabase
      .from('blacklist')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing from blacklist:', error);
    } else {
      fetchBlacklist();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">Черный список</h2>

        <form onSubmit={handleAddToBlacklist} className="space-y-4">
          <input
            type="text"
            placeholder="Номер бейджика"
            value={badgeNumber}
            onChange={(e) => setBadgeNumber(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Комментарий"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Добавление...' : 'Добавить в черный список'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-center ${
              message.includes('успешно') || message.includes('добавлен')
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-blue-900">
          Список ({blacklist.length})
        </h3>

        {blacklist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Черный список пуст</p>
          </div>
        ) : (
          blacklist.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-lg p-6 flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Номер бейджика</p>
                <p className="text-2xl font-bold text-red-600 mb-4">{entry.badge_number}</p>

                <p className="text-sm text-gray-600 mb-1">Комментарий</p>
                <p className="text-gray-800 mb-4">{entry.comment || '—'}</p>

                <p className="text-xs text-gray-500">
                  Добавлен: {new Date(entry.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <button
                onClick={() => handleRemoveFromBlacklist(entry.id)}
                className="ml-4 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BlacklistPage;

import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { getTodayString } from '../lib/date';

type Identifiable = {
  id: number;
};

type UseDailyLogPageOptions<TItem extends Identifiable, TForm> = {
  createInitialFormData: (date: string) => TForm;
  deleteConfirmMessage: string;
  deleteErrorMessage: string;
  getItemDate: (item: TItem) => string;
  getItems: (date: string) => Promise<TItem[]>;
  loadErrorMessage: string;
  toFormData: (item: TItem) => TForm;
  deleteItem: (id: number) => Promise<void>;
};

export function useDailyLogPage<TItem extends Identifiable, TForm>({
  createInitialFormData,
  deleteConfirmMessage,
  deleteErrorMessage,
  getItemDate,
  getItems,
  loadErrorMessage,
  toFormData,
  deleteItem,
}: UseDailyLogPageOptions<TItem, TForm>) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [items, setItems] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(() =>
    createInitialFormData(getTodayString()),
  );

  const selectedDateLabel = useMemo(
    () =>
      new Date(`${selectedDate}T00:00:00`).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [selectedDate],
  );

  const loadItems = async (targetDate: string) => {
    try {
      setLoading(true);
      setError('');
      const records = await getItems(targetDate);
      const sorted = [...records].sort(
        (a, b) =>
          new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime(),
      );
      setItems(sorted);
    } catch (err) {
      setError(getErrorMessage(err, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!editingItem) {
      setFormData(createInitialFormData(selectedDate));
    }
  }, [selectedDate, editingItem, createInitialFormData]);

  const resetForm = () => {
    setFormData(createInitialFormData(selectedDate));
    setEditingItem(null);
    setShowForm(false);
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
      return;
    }

    setShowForm(true);
  };

  const handleEdit = (item: TItem) => {
    setEditingItem(item);
    setFormData(toFormData(item));
    setShowForm(true);
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    if (!confirm(deleteConfirmMessage)) {
      return false;
    }

    try {
      setError('');
      await deleteItem(id);
      await loadItems(selectedDate);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, deleteErrorMessage));
      return false;
    }
  };

  return {
    editingItem,
    error,
    formData,
    handleDelete,
    handleEdit,
    items,
    loadItems,
    loading,
    resetForm,
    selectedDate,
    selectedDateLabel,
    setError,
    setFormData,
    setShowForm,
    setSelectedDate,
    showForm,
    toggleForm,
  };
}

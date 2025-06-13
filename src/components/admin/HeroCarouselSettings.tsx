import React, { useEffect, useState, useRef } from 'react';
import { HeroCarouselApi } from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';
import Toast from '../Toast';

interface HeroCarousel {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
  order: number;
  is_active: boolean;
}

const HeroCarouselSettings: React.FC = () => {
  const { token } = useAuth();
  const [carousels, setCarousels] = useState<HeroCarousel[]>([]);
  const [intervalInput, setIntervalInput] = useState<number>(5000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<HeroCarousel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<HeroCarousel> & { image?: File | null }>({
    image: null,
    title: '',
    subtitle: '',
    link: '',
    order: 0,
    is_active: true,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!token) return;
      const res = await HeroCarouselApi.getAll(token);
      setCarousels(res.data.carousels);
      setIntervalInput(res.data.interval);
    } catch (err: any) {
      setError('Failed to load hero carousel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [token]);

  const handleEdit = (carousel: HeroCarousel) => {
    setEditing(carousel);
    setForm({ ...carousel, image: null });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Delete this slide?')) return;
    try {
      await HeroCarouselApi.delete(token, id);
      showToast('Slide deleted successfully.', 'success');
      fetchData();
    } catch (err: any) {
      showToast('Failed to delete slide.', 'error');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setValidationErrors({});
    setError(null);
    const formData = new FormData();
    if (form.image) formData.append('image', form.image);
    formData.append('title', form.title || '');
    formData.append('subtitle', form.subtitle || '');
    formData.append('link', form.link || '');
    formData.append('order', String(form.order || 0));
    formData.append('is_active', form.is_active ? '1' : '0');
    try {
      if (editing) {
        await HeroCarouselApi.update(token, editing.id, formData);
        showToast('Slide updated successfully.', 'success');
      } else {
        await HeroCarouselApi.create(token, formData);
        showToast('Slide created successfully.', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ image: null, title: '', subtitle: '', link: '', order: 0, is_active: true });
      fetchData();
    } catch (err: any) {
      if (err && err.message && err.message.includes('422')) {
        if (err.response && err.response.errors) {
          setValidationErrors(err.response.errors);
        } else if (err.errors) {
          setValidationErrors(err.errors);
        } else {
          setError('Validation error. Please check your input.');
        }
        showToast('Validation error. Please check your input.', 'error');
      } else if (err && err.errors) {
        setValidationErrors(err.errors);
        showToast('Validation error. Please check your input.', 'error');
      } else {
        setError(err.message || 'Failed to save.');
        showToast(err.message || 'Failed to save.', 'error');
      }
    }
  };

  const handleIntervalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntervalInput(parseInt(e.target.value, 10));
  };

  const handleSaveInterval = async () => {
    if (!token) return;
    try {
      await HeroCarouselApi.updateInterval(token, intervalInput);
      fetchData();
    } catch (err: any) {
      showToast('Failed to update interval.', 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <h2 className="text-xl font-medium mb-6">Hero Carousel Settings</h2>
      <div className="mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Change Interval (ms)</label>
          <input
            type="number"
            min={1000}
            step={100}
            value={intervalInput}
            onChange={handleIntervalInputChange}
            className="w-40 border-gray-300 rounded-md shadow-sm p-2 border"
          />
        </div>
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={handleSaveInterval}
        >
          Save Settings
        </button>
      </div>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Slides</h3>
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => { setShowForm(true); setEditing(null); setForm({ image: null, title: '', subtitle: '', link: '', order: 0, is_active: true }); }}
        >
          Add Slide
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Subtitle</th>
                <th className="px-4 py-2">Link</th>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carousels.map((slide) => (
                <tr key={slide.id} className="border-b">
                  <td className="px-4 py-2">
                    {slide.image_url && <img src={slide.image_url} alt="" className="h-16 w-32 object-cover rounded" />}
                  </td>
                  <td className="px-4 py-2">{slide.title}</td>
                  <td className="px-4 py-2">{slide.subtitle}</td>
                  <td className="px-4 py-2">{slide.link}</td>
                  <td className="px-4 py-2">{slide.order}</td>
                  <td className="px-4 py-2">{slide.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="text-blue-600 hover:underline" onClick={() => handleEdit(slide)}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDelete(slide.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General error */}
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
              {form.image && <div className="mt-2 text-xs text-gray-500">Selected: {form.image.name}</div>}
              {!form.image && form.image_url && <img src={form.image_url} alt="" className="h-16 w-32 object-cover rounded mt-2" />}
              {validationErrors.image && <div className="text-red-600 text-xs mt-1">{validationErrors.image.join(', ')}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" value={form.title || ''} onChange={handleFormChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              {validationErrors.title && <div className="text-red-600 text-xs mt-1">{validationErrors.title.join(', ')}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <input type="text" name="subtitle" value={form.subtitle || ''} onChange={handleFormChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              {validationErrors.subtitle && <div className="text-red-600 text-xs mt-1">{validationErrors.subtitle.join(', ')}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Link</label>
              <input type="text" name="link" value={form.link || ''} onChange={handleFormChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              {validationErrors.link && <div className="text-red-600 text-xs mt-1">{validationErrors.link.join(', ')}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Order</label>
              <input type="number" name="order" value={form.order || 0} onChange={handleFormChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              {validationErrors.order && <div className="text-red-600 text-xs mt-1">{validationErrors.order.join(', ')}</div>}
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleFormChange} className="mr-2" />
                Active
              </label>
              {validationErrors.is_active && <div className="text-red-600 text-xs mt-1">{validationErrors.is_active.join(', ')}</div>}
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">{editing ? 'Update' : 'Create'}</button>
              <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => { setShowForm(false); setEditing(null); setValidationErrors({}); setError(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HeroCarouselSettings; 
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnnouncementService } from '../../services/AnnouncementService';
import type { AnnouncementData } from '../../types/announcement';

interface AnnouncementFormProps {
  token: string;
}

const AnnouncementForm = ({ token }: AnnouncementFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<Omit<AnnouncementData, 'id' | 'createdAt' | 'updatedAt'>>({
    text: '',
    isActive: true,
    displayOrder: 0,
    buttonText: null,
    buttonLink: null,
    backgroundColor: '#000000',
    textColor: '#FFFFFF'
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch announcement data if editing
  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!isEditing) return;
      
      try {
        setLoading(true);
        const data = await AnnouncementService.getAnnouncementById(token, Number(id));
        setFormData({
          text: data.text,
          isActive: data.isActive,
          displayOrder: data.displayOrder,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          backgroundColor: data.backgroundColor,
          textColor: data.textColor
        });
      } catch (err) {
        setError('Failed to load announcement data. Please try again.');
        console.error('Error fetching announcement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id, isEditing, token]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'isActive' && type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    
    try {
      if (isEditing) {
        await AnnouncementService.updateAnnouncement(token, Number(id), formData);
        setSuccess('Announcement updated successfully!');
      } else {
        await AnnouncementService.createAnnouncement(token, formData);
        setSuccess('Announcement created successfully!');
        // Reset form after successful creation
        setFormData({
          text: '',
          isActive: true,
          displayOrder: 0,
          buttonText: null,
          buttonLink: null,
          backgroundColor: '#000000',
          textColor: '#FFFFFF'
        });
      }
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} announcement. Please try again.`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} announcement:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  // Go back to announcements list
  const handleCancel = () => {
    navigate('/admin/announcements');
  };

  if (loading) {
    return <div className="p-4">Loading announcement data...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-header mb-6">
        {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Announcement Text */}
        <div>
          <label htmlFor="text" className="block mb-1 font-medium">
            Announcement Text*
          </label>
          <input
            type="text"
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300"
            placeholder="Enter announcement text"
          />
        </div>

        {/* Display Order */}
        <div>
          <label htmlFor="displayOrder" className="block mb-1 font-medium">
            Display Order
          </label>
          <input
            type="number"
            id="displayOrder"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300"
            min="0"
          />
          <p className="text-sm text-gray-500 mt-1">
            Lower numbers appear first. Announcements with the same order are sorted by creation date.
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isActive" className="font-medium">
            Active (visible to users)
          </label>
        </div>

        {/* Button Text */}
        <div>
          <label htmlFor="buttonText" className="block mb-1 font-medium">
            Button Text (Optional)
          </label>
          <input
            type="text"
            id="buttonText"
            name="buttonText"
            value={formData.buttonText || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300"
            placeholder="e.g., Shop Now"
          />
        </div>

        {/* Button Link */}
        <div>
          <label htmlFor="buttonLink" className="block mb-1 font-medium">
            Button Link (Optional)
          </label>
          <input
            type="text"
            id="buttonLink"
            name="buttonLink"
            value={formData.buttonLink || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300"
            placeholder="e.g., /sale"
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="backgroundColor" className="block mb-1 font-medium">
              Background Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                id="backgroundColor"
                name="backgroundColor"
                value={formData.backgroundColor}
                onChange={handleChange}
                className="h-10 w-10 mr-2"
              />
              <input
                type="text"
                name="backgroundColor"
                value={formData.backgroundColor}
                onChange={handleChange}
                className="flex-1 p-2 border border-gray-300"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label htmlFor="textColor" className="block mb-1 font-medium">
              Text Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                id="textColor"
                name="textColor"
                value={formData.textColor}
                onChange={handleChange}
                className="h-10 w-10 mr-2"
              />
              <input
                type="text"
                name="textColor"
                value={formData.textColor}
                onChange={handleChange}
                className="flex-1 p-2 border border-gray-300"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Preview</h3>
          <div 
            className="p-3 flex items-center justify-center"
            style={{ 
              backgroundColor: formData.backgroundColor,
              color: formData.textColor 
            }}
          >
            <span>{formData.text}</span>
            {formData.buttonText && (
              <button 
                className="ml-4 px-3 py-1 border border-current"
                style={{ color: formData.textColor }}
              >
                {formData.buttonText}
              </button>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-100"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white hover:bg-gray-800"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Announcement' : 'Create Announcement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm; 
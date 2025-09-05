import { useState, useEffect } from "react";
import { AnnouncementService } from "../../services/AnnouncementService";
import type { AnnouncementData } from "../../types/announcement";
import { useNavigate } from "react-router-dom";

interface ManageAnnouncementsProps {
  token: string;
}

const ManageAnnouncements = ({ token }: ManageAnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnnouncementService.getAllAnnouncements(token);
      // Sort by display order
      const sortedData = [...data].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      setAnnouncements(sortedData);
    } catch (err) {
      setError("Failed to load announcements. Please try again.");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  // Toggle announcement active status
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await AnnouncementService.toggleAnnouncementStatus(
        token,
        id,
        !currentStatus
      );
      // Update local state
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !currentStatus } : item
        )
      );
    } catch (err) {
      setError("Failed to update announcement status. Please try again.");
      console.error("Error updating announcement status:", err);
    }
  };

  // Delete announcement
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      await AnnouncementService.deleteAnnouncement(token, id);
      // Update local state
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to delete announcement. Please try again.");
      console.error("Error deleting announcement:", err);
    }
  };

  // Edit announcement
  const handleEdit = (id: number) => {
    navigate(`/admin/announcements/edit/${id}`);
  };

  // Create new announcement
  const handleCreate = () => {
    navigate("/admin/announcements/new");
  };

  if (loading) {
    return <div className="p-4">Loading announcements...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl header-font">Manage Announcements</h2>
        <button
          onClick={handleCreate}
          className="bg-black text-white px-4 py-2 hover:bg-gray-800"
        >
          Create New Announcement
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-gray-500">
          No announcements found. Create your first one!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Order</th>
                <th className="py-2 px-4 text-left">Text</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Button</th>
                <th className="py-2 px-4 text-left">Colors</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-t">
                  <td className="py-2 px-4">{announcement.displayOrder}</td>
                  <td className="py-2 px-4">{announcement.text}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded ${
                        announcement.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {announcement.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {announcement.buttonText ? (
                      <span className="text-sm">
                        {announcement.buttonText} → {announcement.buttonLink}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: announcement.backgroundColor,
                        }}
                        title={`Background: ${announcement.backgroundColor}`}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: announcement.textColor }}
                        title={`Text: ${announcement.textColor}`}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(announcement.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            announcement.id,
                            announcement.isActive
                          )
                        }
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        {announcement.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageAnnouncements;

import React, { useEffect, useState } from 'react';
import { AdminUserApi } from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/user';

interface PasswordModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: number, password: string, password_confirmation: string) => void;
  isLoading: boolean;
  error: string | null;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ user, isOpen, onClose, onSubmit, isLoading, error }) => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  useEffect(() => {
    setPassword('');
    setPasswordConfirmation('');
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Change Password for {user.name}</h3>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={passwordConfirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded text-gray-700"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-black text-white rounded"
            onClick={() => onSubmit(user.id, password, passwordConfirmation)}
            disabled={isLoading || !password || !passwordConfirmation}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageUsers: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!token) return;
      const res = await AdminUserApi.getAllUsers(token);
      setUsers(res.users || []);
    } catch (err: any) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.profile?.instagram_username?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setModalError(null);
    setSuccessMsg(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalError(null);
    setSuccessMsg(null);
  };

  const handleChangePassword = async (userId: number, password: string, password_confirmation: string) => {
    setModalLoading(true);
    setModalError(null);
    try {
      if (!token) return;
      await AdminUserApi.changeUserPassword(token, userId, password, password_confirmation);
      setSuccessMsg('Password updated successfully.');
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update password.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Manage Users</h2>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Search by name, email, or Instagram username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
        />
      </div>
      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mb-6 hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Instagram</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">{user.profile?.instagram_username || ''}</td>
                  <td className="px-4 py-2">
                    {user.profile ? [user.profile.address_line1, user.profile.barangay, user.profile.city, user.profile.province].filter(Boolean).join(', ') : ''}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-black text-white px-3 py-1 rounded text-sm"
                      onClick={() => handleOpenModal(user)}
                    >
                      Change Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile view: cards */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-gray-50 rounded shadow p-4 flex flex-col gap-2">
                <div className="font-semibold text-lg">{user.name}</div>
                <div className="text-sm text-gray-700">{user.email}</div>
                <div className="text-xs text-gray-500">Role: {user.role}</div>
                <div className="text-xs text-gray-500">Instagram: {user.profile?.instagram_username || ''}</div>
                <div className="text-xs text-gray-500">Address: {user.profile ? [user.profile.address_line1, user.profile.barangay, user.profile.city, user.profile.province].filter(Boolean).join(', ') : ''}</div>
                <button
                  className="mt-2 bg-black text-white px-3 py-1 rounded text-sm self-start"
                  onClick={() => handleOpenModal(user)}
                >
                  Change Password
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <PasswordModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleChangePassword}
        isLoading={modalLoading}
        error={modalError}
      />
      {successMsg && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
          {successMsg}
        </div>
      )}
    </div>
  );
};

export default ManageUsers; 
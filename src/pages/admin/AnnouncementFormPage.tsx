import { useAuth } from '../../context/AuthContext';
import AnnouncementForm from '../../components/admin/AnnouncementForm';

const AnnouncementFormPage = () => {
  const { token } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <AnnouncementForm token={token || ''} />
    </div>
  );
};

export default AnnouncementFormPage; 
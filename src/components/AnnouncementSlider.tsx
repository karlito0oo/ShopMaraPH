import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { AnnouncementData } from '../types/announcement';
import { AnnouncementService } from '../services/AnnouncementService';

const AnnouncementSlider = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await AnnouncementService.getActiveAnnouncements();
        // Sort by display order
        const sortedData = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
        setAnnouncements(sortedData);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Auto-rotate announcements every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % announcements.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Manual navigation
  const goToAnnouncement = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // If no announcements or still loading, don't render anything
  if (loading) {
    return null;
  }

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="w-full">
      <div 
        className="w-full py-3 px-4 flex items-center justify-center transition-all duration-300"
        style={{ 
          backgroundColor: currentAnnouncement.backgroundColor,
          color: currentAnnouncement.textColor 
        }}
      >
        <div className="flex items-center justify-center flex-1">
          <p className="text-center font-body font-light">{currentAnnouncement.text}</p>
          
          {currentAnnouncement.buttonText && currentAnnouncement.buttonLink && (
            <Link 
              to={currentAnnouncement.buttonLink}
              className="ml-4 px-3 py-1 border border-current hover:bg-opacity-20 hover:bg-white transition-colors"
            >
              {currentAnnouncement.buttonText}
            </Link>
          )}
        </div>
        
        {/* Dots navigation for multiple announcements */}
        {announcements.length > 1 && (
          <div className="flex gap-2 ml-4">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => goToAnnouncement(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex 
                    ? 'bg-current opacity-100' 
                    : 'bg-current opacity-50'
                }`}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementSlider; 
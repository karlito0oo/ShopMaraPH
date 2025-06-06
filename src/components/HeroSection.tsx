import { useState, useEffect } from 'react';
import AnnouncementSlider from './AnnouncementSlider';

const sampleImages = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80',
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sampleImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[450px] md:h-[600px] flex items-center justify-center overflow-hidden border-b border-gray-200 bg-black">
      {/* Carousel Images */}
      {sampleImages.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt="carousel background"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
          style={{ transitionProperty: 'opacity' }}
        />
      ))}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center h-full">
        <h1 className="text-5xl md:text-7xl font-como font-light mb-4 text-center text-white drop-shadow-lg">SHOPMARA PH</h1>
        <div className="bg-[#ad688f] px-6 py-2 mb-8 bg-opacity-90 rounded">
          <p className="text-lg font-como font-light text-white">Timeless Finds, Consciously Curated</p>
        </div>
        <div className="max-w-2xl text-center px-4">
          <p className="text-gray-100 mb-8 font-como font-light drop-shadow">
            ShopMaraPH is a passion project rooted in timeless style and conscious living. We offer carefully handpicked vintage polos—elegant, versatile pieces made for modern women who lead, whether in the office or off-duty. Beautifully curated, sustainably sourced.
          </p>
          <AnnouncementSlider />
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 
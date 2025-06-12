import { useState, useEffect } from 'react';
import AnnouncementSlider from './AnnouncementSlider';
import { HeroCarouselApi } from '../services/ApiService';

const sampleImages = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80',
];

const HeroSection = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [intervalMs, setIntervalMs] = useState<number>(4000);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    HeroCarouselApi.getPublic().then(res => {
      if (res.data.carousels && res.data.carousels.length > 0) {
        setSlides(res.data.carousels);
        setIntervalMs(res.data.interval || 4000);
      } else {
        setSlides(sampleImages.map(url => ({ image_url: url })));
        setIntervalMs(4000);
      }
    }).catch(() => {
      setSlides(sampleImages.map(url => ({ image_url: url })));
      setIntervalMs(4000);
    });
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [slides, intervalMs]);

  return (
    <div className="relative w-full h-[450px] md:h-[600px] flex items-center justify-center overflow-hidden border-b border-gray-200 bg-black">
      {/* Carousel Images */}
      {slides.map((slide, idx) => (
        <img
          key={slide.image_url + idx}
          src={slide.image_url}
          alt="carousel background"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
          style={{ transitionProperty: 'opacity' }}
        />
      ))}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center h-full">
        {slides[current]?.title ? (
          <h1 className="text-5xl md:text-7xl font-como font-light mb-4 text-center text-white drop-shadow-lg">{slides[current].title}</h1>
        ) : (
          <h1 className="text-5xl md:text-7xl font-como font-light mb-4 text-center text-white drop-shadow-lg">SHOPMARA PH</h1>
        )}
        {slides[current]?.subtitle ? (
          <div className="bg-[#ad688f] px-6 py-2 mb-8 bg-opacity-90 rounded">
            <p className="text-lg font-como font-light text-white">{slides[current].subtitle}</p>
          </div>
        ) : (
          <div className="bg-[#ad688f] px-6 py-2 mb-8 bg-opacity-90 rounded">
            <p className="text-lg font-como font-light text-white">Timeless Finds, Consciously Curated</p>
          </div>
        )}
        <div className="max-w-2xl text-center px-4">
          {slides[current]?.link ? (
            <a href={slides[current].link} className="text-white underline mb-4 block" target="_blank" rel="noopener noreferrer">
              {slides[current].link}
            </a>
          ) : null}
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
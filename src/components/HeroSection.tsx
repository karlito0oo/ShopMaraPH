import { useState, useEffect, useRef } from "react";
import AnnouncementSlider from "./AnnouncementSlider";
import { HeroCarouselApi } from "../services/ApiService";

const sampleImages = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80",
];

const HeroSection = () => {
  const [allSlides, setAllSlides] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [intervalMs, setIntervalMs] = useState<number>(4000);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    HeroCarouselApi.getPublic()
      .then((res) => {
        if (res.data.carousels && res.data.carousels.length > 0) {
          setAllSlides(res.data.carousels);
          setIntervalMs(res.data.interval || 4000);
        } else {
          setAllSlides(
            sampleImages.map((url) => ({
              image_url: url,
              view_type: "desktop",
            }))
          );
          setIntervalMs(4000);
        }
      })
      .catch(() => {
        setAllSlides(
          sampleImages.map((url) => ({ image_url: url, view_type: "desktop" }))
        );
        setIntervalMs(4000);
      });
  }, []);

  // Detect screen size and update isMobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Filter slides based on viewport type
  useEffect(() => {
    if (allSlides.length === 0) return;

    const viewType = isMobile ? "mobile" : "desktop";
    const filteredSlides = allSlides.filter(
      (slide) => slide.view_type === viewType && slide.is_active !== false
    );

    // If no slides for current viewport, fall back to all slides
    if (filteredSlides.length === 0) {
      setSlides(allSlides.filter((slide) => slide.is_active !== false));
    } else {
      setSlides(filteredSlides);
    }

    // Reset carousel position when slides change
    setCurrent(0);
    setPrev(0);
  }, [allSlides, isMobile]);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setPrev(current);
      setCurrent((prevIdx) => (prevIdx + 1) % slides.length);
      setIsSliding(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsSliding(false), 700); // match transition duration
    }, intervalMs);
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [slides, intervalMs, current]);

  // Helper to determine slide position
  const getSlideStyle = (idx: number) => {
    if (idx === current && isSliding) {
      return {
        transform: "translateX(0%)",
        transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 2,
        opacity: 1,
      };
    }
    if (idx === prev && isSliding) {
      return {
        transform: "translateX(-100%)",
        transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 1,
        opacity: 1,
      };
    }
    if (idx === current && !isSliding) {
      return {
        transform: "translateX(0%)",
        transition: "none",
        zIndex: 2,
        opacity: 1,
      };
    }
    return {
      transform: "translateX(100%)",
      transition: "none",
      zIndex: 0,
      opacity: 0,
    };
  };

  return (
    <div className="relative w-full h-[450px] md:h-[600px] flex items-center justify-center overflow-hidden border-b border-gray-200 bg-black">
      {/* Carousel Images */}
      <div className="absolute top-0 left-0 w-full h-full">
        {slides.map((slide, idx) => (
          <img
            key={slide.image_url + idx}
            src={slide.image_url}
            alt="carousel background"
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={getSlideStyle(idx)}
          />
        ))}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center h-full">
        {slides[current]?.title ? (
          <h1 className="text-5xl md:text-7xl font-header font-light mb-4 text-center text-white drop-shadow-lg">
            {slides[current].title}
          </h1>
        ) : (
          <h1 className="text-5xl md:text-7xl font-header font-light mb-4 text-center text-white drop-shadow-lg">
            SHOPMARA PH
          </h1>
        )}
        {slides[current]?.subtitle ? (
          <div className="bg-[#ad688f] px-6 py-2 mb-8 bg-opacity-90 rounded">
            <p className="text-lg font-body font-light text-white">
              {slides[current].subtitle}
            </p>
          </div>
        ) : (
          <div className="bg-[#ad688f] px-6 py-2 mb-8 bg-opacity-90 rounded">
            <p className="text-lg font-body font-light text-white">
              Carefully Curated Timeless Finds
            </p>
          </div>
        )}
        <div className="max-w-2xl text-center px-4">
          {slides[current]?.link ? (
            <a
              href={slides[current].link}
              className="text-white underline mb-4 block"
              target="_blank"
              rel="noopener noreferrer"
            >
              {slides[current].link}
            </a>
          ) : null}
          <p className="text-gray-100 mb-8 font-body font-light drop-shadow">
            ShopMaraPH is a passion project rooted in timeless style and
            conscious living. We offer carefully handpicked vintage
            polos—elegant, versatile pieces made for modern women who lead,
            whether in the office or off-duty. Beautifully curated, sustainably
            sourced.
          </p>
          <AnnouncementSlider />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

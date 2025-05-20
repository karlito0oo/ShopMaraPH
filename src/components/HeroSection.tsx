const HeroSection = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center bg-white border-b border-gray-200">
      <div className="mb-6">
        <img 
          src="/app-logo.jpg" 
          alt="ShopMara PH Logo" 
          className="h-32 w-auto"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/180x180?text=ShopMara+PH';
          }}
        />
      </div>
      <h1 className="text-5xl md:text-7xl font-como font-light mb-4 text-center">ShopMara PH</h1>
      <div className="bg-[#ad688f] px-6 py-2 mb-8">
        <p className="text-lg font-como font-light text-white">There's One for Everyone</p>
      </div>
      <div className="max-w-2xl text-center px-4">
        <p className="text-gray-600 mb-8 font-como font-light">
        ShopMaraPH is a passion project rooted in timeless style and conscious living. We offer carefully handpicked vintage polos—elegant, versatile pieces made for modern women who lead,
        whether in the office or off-duty. Beautifully curated, sustainably sourced.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="/products" 
            className="bg-black text-white px-8 py-3 rounded-sm hover:bg-gray-800 transition-colors no-underline font-como font-light"
          >
            All Products
          </a>
          <a 
            href="/new" 
            className="bg-black text-white px-8 py-3 rounded-sm hover:bg-gray-800 transition-colors no-underline font-como font-light"
          >
            New Arrivals
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 
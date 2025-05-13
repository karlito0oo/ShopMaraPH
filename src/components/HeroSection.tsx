const HeroSection = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center bg-white border-b border-gray-200">
      <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center">ShopMara PH</h1>
      <div className="bg-yellow-300 px-6 py-2 mb-8">
        <p className="text-lg font-medium">There's One for Everyone</p>
      </div>
      <div className="max-w-2xl text-center px-4">
        <p className="text-gray-600 mb-8">
          Welcome to ShopMara PH, where fashion meets comfort. Our curated collection offers stylish options for every occasion, ensuring you always find the perfect fit.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="/women" 
            className="bg-black text-white px-8 py-3 rounded-sm hover:bg-gray-800 transition-colors no-underline"
          >
            Shop Women
          </a>
          <a 
            href="/men" 
            className="bg-black text-white px-8 py-3 rounded-sm hover:bg-gray-800 transition-colors no-underline"
          >
            Shop Men
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 
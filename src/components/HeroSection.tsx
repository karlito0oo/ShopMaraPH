const HeroSection = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center bg-white border-b border-gray-200">
      <h1 className="text-5xl md:text-7xl font-como font-light mb-4 text-center">SHOPMARA PH</h1>
      <div className="bg-[#ad688f] px-6 py-2 mb-8">
        <p className="text-lg font-como font-light text-white">Timeless Finds, Consciously Curated</p>
      </div>
      <div className="max-w-2xl text-center px-4">
        <p className="text-gray-600 mb-8 font-como font-light">
        ShopMaraPH is a passion project rooted in timeless style and conscious living. We offer carefully handpicked vintage polos—elegant, versatile pieces made for modern women who lead,
        whether in the office or off-duty. Beautifully curated, sustainably sourced.
        </p>
        <div className="bg-black text-white py-5 px-10">
              New Arrivals on May 24 @ 7PM
            </div>
      </div>
    </div>
  );
};

export default HeroSection; 
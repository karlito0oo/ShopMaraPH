const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <img
            src="/app-logo.jpg"
            alt="ShopMara PH Logo"
            className="h-28 w-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://via.placeholder.com/180x180?text=ShopMara+PH";
            }}
          />
        </div>
        <h1 className="text-4xl header-font font-light text-gray-900 mb-4">
          About ShopMara PH
        </h1>
        <div className="w-20 h-1 bg-[#ad688f] mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <img
            src="/mara.png"
            alt="ShopMara PH"
            className="rounded-lg shadow-lg w-full h-auto object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://via.placeholder.com/600x800?text=ShopMara+PH";
            }}
          />
        </div>
        <div>
          <h2 className="text-3xl header-font font-light text-gray-900 mb-6">
            Story Time!
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed font-body font-light">
            ShopMaraPH started in 2022 on Instagram, born from a love of vintage
            fashion and sustainability. After a heartbreaking loss that year, we
            lent the name "Mara" to our business as a tribute to our angel baby.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed font-body font-light">
            In 2023, we paused operations due to severe nausea. Little did we
            know, we were expecting our rainbow baby, who would one day carry
            the name Mara, just as it was meant to be.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed font-body font-light">
            Now a proud mom of two, I spend my days curating timeless pieces I
            love—elegant, confident styles that help modern women build a
            conscious wardrobe for work and beyond.
          </p>
          <p className="text-gray-700 font-body font-light italic">
            This journey is for her, and we can't wait to grow with you.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ad688f]/20 text-[#ad688f] mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg header-font font-normal mb-2">
              Sustainable Fashion
            </h3>
            <p className="text-gray-600 font-body font-light">
              Curated pieces that are timeless and eco-conscious
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ad688f]/20 text-[#ad688f] mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg header-font font-normal mb-2">
              Made with Love
            </h3>
            <p className="text-gray-600 font-body font-light">
              Each piece is selected with purpose and meaning
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ad688f]/20 text-[#ad688f] mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h3 className="text-lg header-font font-normal mb-2">
              Elegant Designs
            </h3>
            <p className="text-gray-600 font-body font-light">
              Confident styles for the modern woman
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl header-font font-normal mb-6">
          Connect With Us
        </h3>
        <div className="flex justify-center space-x-6">
          <a
            href="https://instagram.com/shopmaraph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[#ad688f]"
          >
            <span className="sr-only">Instagram</span>
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href="https://facebook.com/shopmaraph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[#ad688f]"
          >
            <span className="sr-only">Facebook</span>
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href="mailto:contact@shopmaraph.com"
            className="text-gray-500 hover:text-[#ad688f]"
          >
            <span className="sr-only">Email</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

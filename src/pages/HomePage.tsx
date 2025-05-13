import HeroSection from '../components/HeroSection'
import NewDropsSection from '../components/NewDropsSection'

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <NewDropsSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Additional content will go here */}
      </div>
    </>
  )
}

export default HomePage 
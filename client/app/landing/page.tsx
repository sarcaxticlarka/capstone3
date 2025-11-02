import Hero from './hero';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen">
      <Nav />

      <Hero />

      {/* Coming soon section  */}
      <section className="px-6 md:px-12 -mt-20 pb-24 relative z-30">
        <div className="max-w-5xl mx-auto text-center bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-10">
          <span className="inline-block px-4 py-2 bg-red-600/20 border border-red-600 rounded-full text-red-500 text-xs font-semibold tracking-wider mb-4">
            Building Phase
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">CINESCOPE is in building phase</h2>
          <p className="text-lg text-gray-400">Coming soon</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import HeroBanner from '../../components/HeroBanner';
import HorizontalSection from '../../components/HorizontalSection';
import ContinueWatching from '../../components/ContinueWatching';
import DisclaimerModal from '../../components/DisclaimerModal';
import SafeNav from '../../components/SafeNav';
import Footer from '../../components/Footer';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen">
      <DisclaimerModal />
      <SafeNav />

      {/* dynamic hero (trending) */}
      <HeroBanner />

      {/* Continue Watching - Shows only for logged-in users */}
      <ContinueWatching />

      {/* Trending Now - Horizontal Scroll */}
      <HorizontalSection
        title="Trending Now"
        apiUrl="/api/tmdb/trending?type=all"
        viewAllHref="/category?type=trending&name=Trending Now"
      />

      {/* Category Sections with Horizontal Scroll */}
      <HorizontalSection
        title="New Releases"
        apiUrl="/api/tmdb/discover?type=movie&sort_by=primary_release_date.desc&vote_count.gte=100"
        viewAllHref="/category?type=new-releases&name=New Releases"
      />
      
      <HorizontalSection
        title="Emotional & Drama"
        apiUrl="/api/tmdb/discover?type=movie&genre=18&sort_by=vote_average.desc&vote_count.gte=500"
        viewAllHref="/category?genre=18&name=Drama"
      />

      <HorizontalSection
        title="Romantic"
        apiUrl="/api/tmdb/discover?type=movie&genre=10749&sort_by=vote_average.desc&vote_count.gte=200"
        viewAllHref="/category?genre=10749&name=Romance"
      />

      <HorizontalSection
        title="Blockbusters"
        apiUrl="/api/tmdb/discover?type=movie&sort_by=popularity.desc&vote_count.gte=1000"
        viewAllHref="/category?type=blockbusters&name=Blockbusters"
      />

      <HorizontalSection
        title="Hollywood Action"
        apiUrl="/api/tmdb/discover?type=movie&genre=28&with_original_language=en&sort_by=popularity.desc&vote_count.gte=500"
        viewAllHref="/category?genre=28&name=Action"
      />

      <HorizontalSection
        title="Bollywood"
        apiUrl="/api/tmdb/discover?type=movie&with_original_language=hi&sort_by=popularity.desc&vote_count.gte=100"
        viewAllHref="/category?lang=hi&name=Bollywood"
      />

      <HorizontalSection
        title="New Series"
        apiUrl="/api/tmdb/discover?type=tv&sort_by=first_air_date.desc&vote_count.gte=50"
        viewAllHref="/category?type=new-series&name=New Series"
      />

      <HorizontalSection
        title="Popular TV Shows"
        apiUrl="/api/tmdb/discover?type=tv&sort_by=popularity.desc&vote_count.gte=100"
        viewAllHref="/TV-Shows"
      />

      <Footer />
    </div>
  );
}
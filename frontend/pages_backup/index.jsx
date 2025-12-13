import HomeHero from "../components/layout/HomeHero";
import ScheduleBanner from "../components/layout/ScheduleBanner";
import TraitsGrid from "../components/layout/TraitsGrid";
import TopNav from "../components/TopNav";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home-root">
      <TopNav />
      <HomeHero />
      <ScheduleBanner />
      <TraitsGrid />
    </div>
  );
}

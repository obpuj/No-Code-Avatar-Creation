import Image from 'next/image';

export default function HomeHero() {
  return (
    <section className="home-hero">
      <div className="hero-left">
        <h1 className="hero-title">
          THE NO-CODE STAGE <br /> FOR AI CHARACTERS
        </h1>
        <p className="hero-sub">
          Turn Ready Player Me avatars into living, interactive web agents.
        </p>
      </div>

      <div className="hero-right">
        <Image src="/images/hero-avatar.png" className="hero-avatar" alt="avatar" width={400} height={400} />
        <div className="hero-cta-box">
          <p className="cta-label">Alpha Access Opens In</p>
          <div className="cta-timer">97 : 17 : 48 : 05</div>
          <button className="cta-btn">Get Whitelisted</button>
        </div>
      </div>
    </section>
  );
}

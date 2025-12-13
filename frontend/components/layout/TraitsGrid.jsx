import Image from "next/image";

const traits = [
  { img: "/images/trait-1.jpg", label: "Cyber Jacket" },
  { img: "/images/trait-2.jpg", label: "Blue Hair" },
  { img: "/images/trait-3.jpg", label: "Combat Suit" },
  { img: "/images/trait-4.jpg", label: "Urban Hoodie" },
  { img: "/images/trait-5.jpg", label: "Tactical Gear" },
  { img: "/images/trait-6.jpg", label: "Stealth Wear" }
];

export default function TraitsGrid() {
  return (
    <section className="traits-section">
      <h2 className="traits-title">APPEARANCE PRESETS & ASSETS</h2>

      <div className="traits-grid">
        {traits.map((t, i) => (
          <div className="trait-card" key={i}>
            <Image src={t.img} alt={t.label} className="trait-img" width={300} height={300} />
            <p className="trait-label">{t.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

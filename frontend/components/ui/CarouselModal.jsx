import Image from 'next/image';

export default function CarouselModal({ open, onClose, slides, index }) {
  if (!open) return null;

  return (
    <div className="carousel-backdrop">
      <div className="carousel-box">
        <button className="carousel-close" onClick={onClose}>✕</button>

        <div className="carousel-slide">
          <Image src={slides[index].img} alt="" width={800} height={600} />
          <h3>{slides[index].title}</h3>
          <p>{slides[index].desc}</p>
        </div>
      </div>
    </div>
  );
}

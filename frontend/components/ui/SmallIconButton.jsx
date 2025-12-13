import Image from 'next/image';

export default function SmallIconButton({ icon, label, onClick }) {
  return (
    <button className="small-icon-btn" onClick={onClick}>
      <Image src={icon} alt={label} width={24} height={24} />
      <span>{label}</span>
    </button>
  );
}

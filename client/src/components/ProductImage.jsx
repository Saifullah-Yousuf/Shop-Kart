import { useEffect, useState } from 'react';

const EMOJI = { Electronics: '🎧', Fashion: '👟', Home: '🪴', Sports: '⚽' };

// Shows the product photo, or a category emoji if the image is missing or fails to load
export default function ProductImage({ product, className = '' }) {
  const [bad, setBad] = useState(!product?.image);
  useEffect(() => setBad(!product?.image), [product?.image]);
  if (bad) return <div className={`ph ${className}`} aria-label={product?.name}>{EMOJI[product?.category] || '🛍️'}</div>;
  return <img className={className} src={product.image} alt={product.name} loading="lazy" onError={() => setBad(true)} />;
}

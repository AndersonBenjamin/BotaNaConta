const WIDTH = 170;
const HEIGHT = 50;

// Mini-gráfico de área: valores maiores ficam mais altos.
export default function Sparkline({ points }) {
  // Com um único ponto (dia 1 do mês) a linha parte do zero.
  const values = points.length > 1 ? points : [0, points[0] ?? 0];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = WIDTH / (values.length - 1);
  const coords = values.map((value, index) => [
    index * step,
    HEIGHT - 8 - ((value - min) / (max - min || 1)) * (HEIGHT - 16),
  ]);
  const line = coords
    .map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');

  return (
    <svg className="sparkline" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} className="sparkline__area" />
      <path d={line} className="sparkline__line" />
    </svg>
  );
}

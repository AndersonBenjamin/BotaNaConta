// Ícones de linha em SVG (grade 24x24, traço arredondado herdando a cor do texto).
const PATHS = {
  // Categorias
  utensils: (
    <>
      <path d="M4 3v5a3 3 0 0 0 6 0V3" />
      <path d="M7 3v18" />
      <path d="M18 21V3c-2.2 1.4-3.5 4-3.5 7.5V14H18" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  car: (
    <>
      <path d="M5 17V11l2-5h10l2 5v6" />
      <path d="M3 17h18" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
      <path d="M5 11h14" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  pill: (
    <>
      <path d="M4.9 12.1l7.2-7.2a4.6 4.6 0 0 1 6.5 6.5l-7.2 7.2a4.6 4.6 0 0 1-6.5-6.5z" />
      <path d="M8.5 8.5l7 7" />
    </>
  ),
  game: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M8 10v4M6 12h4" />
      <circle cx="15.5" cy="11" r="0.8" />
      <circle cx="17.5" cy="13.5" r="0.8" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  repeat: (
    <>
      <path d="M4 12a8 8 0 0 1 14-5.3" />
      <path d="M18 3v4h-4" />
      <path d="M20 12a8 8 0 0 1-14 5.3" />
      <path d="M6 21v-4h4" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  box: (
    <>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8" r="1.2" />
    </>
  ),

  // Interface
  plus: <path d="M12 5v14M5 12h14" />,
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18M16 15h2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v8l6 4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  pie: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9h-9z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  logout: (
    <>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M16 8l4 4-4 4" />
      <path d="M20 12H10" />
    </>
  ),
};

// Categorias gravadas com emoji (antes do seed atual): o ícone é escolhido pelo nome.
const ICON_BY_CATEGORY_NAME = {
  Alimentação: 'utensils',
  Mercado: 'cart',
  Transporte: 'car',
  Casa: 'home',
  Saúde: 'pill',
  Lazer: 'game',
  Compras: 'bag',
  Assinaturas: 'repeat',
  Contas: 'receipt',
  Outros: 'box',
};

export default function Icon({ name, size = 22, strokeWidth = 2, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] ?? PATHS.tag}
    </svg>
  );
}

export function CategoryIcon({ category, size }) {
  const name = PATHS[category.icon] ? category.icon : ICON_BY_CATEGORY_NAME[category.name];
  return <Icon name={name ?? 'tag'} size={size} />;
}

export default function Loading({ fullScreen = false, label = 'Carregando...' }) {
  return (
    <div className={fullScreen ? 'loading loading--full' : 'loading'} role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

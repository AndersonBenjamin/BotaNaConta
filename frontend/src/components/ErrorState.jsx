import { getErrorMessage } from '../services/api.js';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <p>{getErrorMessage(error, 'Não foi possível carregar os dados.')}</p>
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

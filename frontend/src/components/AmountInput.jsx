import { formatCentsPlain } from '../utils/money.js';

// Até 99.999.999,99, o limite aceito pela API.
const MAX_DIGITS = 10;

// Campo de valor no estilo "caixa eletrônico": os dígitos entram pela direita.
// Digitar 3, 5, 9, 0 resulta em 35,90. Só precisa do teclado numérico.
export default function AmountInput({ id, cents, onChange, error, autoFocus, ref }) {
  function handleChange(event) {
    const digits = event.target.value.replace(/\D/g, '').slice(-MAX_DIGITS);
    onChange(Number(digits || '0'));
  }

  return (
    <div className={`amount-input${error ? ' has-error' : ''}`}>
      <span className="amount-input__currency" aria-hidden="true">R$</span>
      <input
        ref={ref}
        id={id}
        className="amount-input__field"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatCentsPlain(cents)}
        onChange={handleChange}
        onFocus={(event) => event.target.setSelectionRange(9999, 9999)}
        autoFocus={autoFocus}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
  );
}

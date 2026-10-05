import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useCategories } from '../hooks/useCategories.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  createExpense,
  deleteExpense,
  getExpense,
  updateExpense,
} from '../services/expenses.js';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { centsToAmount, toCents } from '../utils/money.js';
import { today } from '../utils/dates.js';
import AmountInput from '../components/AmountInput.jsx';
import CategoryPicker from '../components/CategoryPicker.jsx';
import Loading from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Icon from '../components/Icon.jsx';

// A mesma rota serve para "novo" e "editar". A key recria o formulário ao trocar de gasto.
export default function ExpenseFormPage() {
  const { id } = useParams();
  return <ExpenseForm key={id ?? 'novo'} id={id} />;
}

const emptyForm = () => ({ cents: 0, categoryId: null, description: '', date: today() });

function ExpenseForm({ id }) {
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const categories = useCategories();
  const amountRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [loadState, setLoadState] = useState({ loading: isEditing, error: null });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;

    getExpense(id)
      .then((expense) => {
        if (cancelled) return;
        setForm({
          cents: toCents(expense.amount),
          categoryId: expense.category.id,
          description: expense.description ?? '',
          date: expense.date,
        });
        setLoadState({ loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setLoadState({ loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    // O valor fica em centavos no formulário, mas o erro vem com o nome usado pela API.
    const errorField = field === 'cents' ? 'amount' : field;
    setFieldErrors((current) => ({ ...current, [errorField]: undefined }));
  }

  // Volta para a tela anterior (lista ou início); se a página foi aberta direto, vai para a lista.
  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/gastos', { replace: true });
  }

  function validate() {
    const errors = {};
    if (form.cents <= 0) errors.amount = 'Informe um valor.';
    if (!form.categoryId) errors.categoryId = 'Escolha uma categoria.';
    if (!form.date) errors.date = 'Informe a data.';
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Sem valor, devolve o foco ao campo para o teclado numérico abrir de novo.
      if (errors.amount) amountRef.current?.focus();
      return;
    }

    const payload = {
      amount: centsToAmount(form.cents),
      categoryId: form.categoryId,
      description: form.description.trim() || null,
      date: form.date,
    };

    setBusy(true);
    try {
      if (isEditing) {
        await updateExpense(id, payload);
        showToast('Gasto atualizado');
        goBack();
      } else {
        await createExpense(payload);
        showToast('Gasto registrado');
        navigate('/');
      }
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Excluir este gasto?')) return;

    setBusy(true);
    try {
      await deleteExpense(id);
      showToast('Gasto excluído');
      goBack();
    } catch (error) {
      setFormError(getErrorMessage(error));
      setBusy(false);
    }
  }

  const title = isEditing ? 'Editar gasto' : 'Novo gasto';

  if (loadState.loading) return <Loading />;
  if (loadState.error) {
    return (
      <>
        <PageTitle title={title} onBack={goBack} />
        <ErrorState error={loadState.error} />
      </>
    );
  }

  return (
    <>
      <PageTitle title={title} onBack={isEditing ? goBack : undefined} />

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="amount">Valor</label>
          <AmountInput
            ref={amountRef}
            id="amount"
            cents={form.cents}
            onChange={(cents) => update('cents', cents)}
            error={fieldErrors.amount}
            autoFocus={!isEditing}
          />
          <FieldError id="amount-error" message={fieldErrors.amount} />
        </div>

        <div className="field">
          <span className="label" id="category-label">Categoria</span>
          {categories.error && <ErrorState error={categories.error} onRetry={categories.reload} />}
          {!categories.data && categories.loading && <Loading />}
          {categories.data && (
            <CategoryPicker
              categories={categories.data}
              value={form.categoryId}
              onChange={(categoryId) => update('categoryId', categoryId)}
              labelledBy="category-label"
            />
          )}
          <FieldError message={fieldErrors.categoryId} />
        </div>

        <div className="field">
          <label htmlFor="description">
            Descrição <span className="label-hint">(opcional)</span>
          </label>
          <input
            id="description"
            type="text"
            maxLength={255}
            autoComplete="off"
            enterKeyHint="done"
            placeholder="Ex.: Almoço"
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            aria-invalid={Boolean(fieldErrors.description)}
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <div className="field">
          <label htmlFor="date">Data</label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
            aria-invalid={Boolean(fieldErrors.date)}
            required
          />
          <FieldError message={fieldErrors.date} />
        </div>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="button button--primary button--block button--large" disabled={busy}>
          {busy ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar gasto'}
        </button>

        {isEditing && (
          <button
            type="button"
            className="button button--danger button--block"
            onClick={handleDelete}
            disabled={busy}
          >
            Excluir gasto
          </button>
        )}
      </form>
    </>
  );
}

function PageTitle({ title, onBack }) {
  return (
    <header className="page-header">
      {onBack && (
        <button type="button" className="icon-button" onClick={onBack} aria-label="Voltar">
          <Icon name="back" />
        </button>
      )}
      <div className="page-header__titles">
        <span className="page-header__eyebrow">Meus Gastos</span>
        <h1>{title}</h1>
      </div>
    </header>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

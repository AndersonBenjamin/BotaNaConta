export default function CategoryPicker({ categories, value, onChange, labelledBy }) {
  return (
    <div className="category-picker" role="group" aria-labelledby={labelledBy}>
      {categories.map((category) => {
        const selected = category.id === value;
        return (
          <button
            key={category.id}
            type="button"
            className={`category-option${selected ? ' is-selected' : ''}`}
            aria-pressed={selected}
            onClick={() => onChange(category.id)}
          >
            <span className="category-option__icon" aria-hidden="true">{category.icon}</span>
            <span className="category-option__name">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}

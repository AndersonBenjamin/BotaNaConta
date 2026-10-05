import { CategoryIcon } from './Icon.jsx';

export default function CategoryPicker({ categories, value, onChange, labelledBy }) {
  return (
    <div className="cats" role="group" aria-labelledby={labelledBy}>
      {categories.map((category) => {
        const selected = category.id === value;
        return (
          <button
            key={category.id}
            type="button"
            className={`cat${selected ? ' cat--active' : ''}`}
            aria-pressed={selected}
            onClick={() => onChange(category.id)}
          >
            <CategoryIcon category={category} />
            <span className="cat__label">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}

import { Link } from 'react-router-dom';

/** Friendly empty state with an arch illustration and an optional action. */
export default function EmptyState({ title, text, action, to, onAction, icon: Icon }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-14 text-center">
      <div className="arch mb-6 grid h-28 w-24 place-items-center bg-petal text-rose">
        {Icon ? <Icon size={30} strokeWidth={1.4} /> : null}
      </div>
      <h3 className="font-display text-[1.75rem]">{title}</h3>
      {text && <p className="mt-2 text-stone">{text}</p>}
      {action && to && (
        <Link to={to} className="btn-primary mt-7">{action}</Link>
      )}
      {action && onAction && (
        <button type="button" onClick={onAction} className="btn-primary mt-7">{action}</button>
      )}
    </div>
  );
}

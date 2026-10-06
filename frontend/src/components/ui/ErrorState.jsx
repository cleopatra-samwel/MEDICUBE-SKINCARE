import { CloudOff } from 'lucide-react';

export default function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-14 text-center" role="alert">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-petal text-rosewood">
        <CloudOff size={24} strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-[1.75rem]">{title}</h3>
      <p className="mt-2 text-stone">{error?.message || 'Please try again in a moment.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline btn-sm mt-6">Try again</button>
      )}
    </div>
  );
}

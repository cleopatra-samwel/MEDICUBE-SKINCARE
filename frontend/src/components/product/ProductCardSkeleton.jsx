export default function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-[4/5] !rounded-arch" />
      <div className="skeleton mt-4 h-3 w-1/3" />
      <div className="skeleton mt-3 h-5 w-3/4" />
      <div className="skeleton mt-2 h-3 w-full" />
      <div className="skeleton mt-4 h-9 w-full !rounded-full" />
    </div>
  );
}

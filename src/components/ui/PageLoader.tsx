export function PageLoader({ label = 'Загрузка...' }: { label?: string }) {
  return (
    <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-tertiary">{label}</p>
      </div>
    </div>
  );
}

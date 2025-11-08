export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 p-4"
          >
            <div className="mb-4 h-6 w-32 rounded bg-white/60"></div>
            <div className="h-10 w-24 rounded bg-white/40"></div>
          </div>
        ))}
      </div>

      <div className="h-64 rounded-2xl border border-dashed border-purple-200 bg-white px-6 py-8 shadow-sm">
        <div className="mb-4 h-6 w-48 rounded bg-purple-100"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-10 rounded bg-purple-50"></div>
          ))}
        </div>
      </div>
    </div>
  )
}


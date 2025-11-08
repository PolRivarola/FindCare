export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 h-6 w-40 rounded bg-gradient-to-r from-purple-100 to-blue-100"></div>
            <div className="space-y-3">
              <div className="h-4 w-3/4 rounded bg-purple-50"></div>
              <div className="h-4 w-2/3 rounded bg-purple-50"></div>
              <div className="h-4 w-1/2 rounded bg-purple-50"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-purple-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-56 rounded bg-purple-100"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-10 rounded bg-purple-50"></div>
          ))}
        </div>
      </div>
    </div>
  )
}


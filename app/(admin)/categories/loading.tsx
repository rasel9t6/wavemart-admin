export default function Loading() {
  return (
    <div className="px-8 py-10">
      <p className="h-6 w-32 animate-pulse rounded-md bg-gray-300 text-heading2-bold"></p>
      <div className="my-4 h-1 rounded bg-gray-200"></div>

      <div className="mt-10 grid grid-cols-2 gap-10 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg bg-white p-6 shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-20 rounded-md bg-gray-300"></div>
                <div className="size-6 rounded-full bg-gray-300"></div>
              </div>
              <div className="h-6 w-24 rounded-md bg-gray-300"></div>
            </div>
          ))}
      </div>

      <div className="mt-10 animate-pulse rounded-lg bg-white p-6 shadow">
        <div className="mb-6 h-4 w-32 rounded-md bg-gray-300"></div>
        <div className="h-64 w-full rounded-md bg-gray-300"></div>
      </div>
    </div>
  );
}

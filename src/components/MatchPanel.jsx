import React from "react";

export default function MatchPanel({ matches }) {
  return (
    <section className="col-span-12 md:col-span-4 min-h-[calc(100vh-64px)] p-6">
      <div className="flex gap-6 mb-6">
        <button className="font-semibold underline">Match</button>
        <button className="text-gray-500 hover:text-gray-700">Message</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(matches.length ? matches.slice(0, 6) : Array.from({ length: 6 })).map((m, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl border grid place-items-center overflow-hidden"
          >
            {m ? (
              <img
                src={m.avatar}
                alt={m.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-300">—</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PlainAiText({ text }) {
  if (!text) return null;

  return (
    <pre
      className="
        whitespace-pre-wrap
        break-words
        font-sans
        text-[14.5px]
        leading-6

        /* Base GitHub dark color */
        text-[#c9d1d9]
      "
    >
      {text.split("\n").map((line, i) => {
        // ── SECTION HEADER (##)
        if (line.startsWith("##")) {
          return (
            <div
              key={i}
              className="
                flex items-center gap-2
                mt-4 mb-1
                text-[15px]
                font-semibold
                text-white
              "
            >
              <span className="text-indigo-400">#</span>
              {line.replace(/^##\s*/, "")}
            </div>
          );
        }

        // ── BULLET (-)
        if (line.startsWith("-")) {
          return (
            <div
              key={i}
              className="
                flex gap-2 ml-4
                text-[#c9d1d9]
                leading-6
              "
            >
              <span className="text-emerald-400">•</span>
              <span>{line.replace(/^-+\s*/, "")}</span>
            </div>
          );
        }

        // ── EMPTY LINE (tight)
        if (!line.trim()) {
          return <div key={i} className="h-1" />;
        }

        // ── NORMAL TEXT
        return (
          <div key={i} className="text-[#c9d1d9] leading-6">
            {line}
          </div>
        );
      })}
    </pre>
  );
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function FormattedText({ content }) {
  if (!content) return null;

  return (
    <div
      className="
        prose prose-invert max-w-none

        /* SECTION SPACING */
        prose-h2:mt-8 prose-h2:mb-3
        prose-ul:mt-2 prose-ul:mb-6
        prose-li:my-1
        prose-p:my-2

        /* COLORS */
        prose-headings:text-white
        prose-headings:font-semibold
        prose-p:text-gray-300
        prose-li:text-gray-300
        prose-strong:text-white

        /* FUTURE SAFE */
        prose-hr:border-white/20
        prose-code:text-indigo-300
        prose-pre:bg-[#020617]
        prose-pre:border prose-pre:border-white/10
        prose-pre:rounded-lg prose-pre:p-4
        prose-pre:text-sm prose-pre:overflow-x-auto
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

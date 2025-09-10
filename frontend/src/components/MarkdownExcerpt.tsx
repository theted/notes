import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

type Props = { content: string };

const MarkdownExcerpt: React.FC<Props> = ({ content }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [clamped, setClamped] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener('resize', check);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [content]);

  return (
    <div className="relative text-gray-400 mt-1 text-sm leading-6 max-h-[800px] overflow-hidden">
      <div ref={ref}>
        <ReactMarkdown
          skipHtml
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        components={{
          // Smaller, tighter typography than full Markdown view
          h1: ({ node, ...props }) => <h1 className="text-xl font-light mt-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-light mt-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-light mt-2" {...props} />,
          p: ({ node, ...props }) => <p className="mt-2" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-indigo-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mt-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mt-1" {...props} />,
          li: ({ node, ...props }) => <li className="mt-0.5" {...props} />,
          // Render images as their alt text only (avoid large previews)
          img: ({ alt }) => <span>{alt || ''}</span>,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-xs">
                {props.children}
              </table>
            </div>
          ),
          th: ({ node, ...props }) => <th className="px-2 py-1 border-b border-white/10" {...props} />,
          td: ({ node, ...props }) => <td className="px-2 py-1 border-b border-white/10" {...props} />,
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="rounded bg-white/10 px-1 py-0.5 text-[0.85em]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="rounded-xl bg-black/50 ring-1 ring-white/10 p-3 overflow-auto max-h-96">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-white/10 pl-3 italic" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-4 border-white/10" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
        }}
      >
        {content || ''}
      </ReactMarkdown>
      </div>
      {clamped && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-black/70" />
      )}
    </div>
  );
};

export default MarkdownExcerpt;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useToast } from './ui/toast';

type Props = { content: string };

const Markdown: React.FC<Props> = ({ content }) => {
  const { show } = useToast();
  return (
    <div className="markdown space-y-4 leading-7 text-gray-200 mt-6">
      <ReactMarkdown
        // Do not allow raw HTML for safety
        skipHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl md:text-4xl font-extralight tracking-tight mt-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl md:text-3xl font-extralight tracking-tight mt-6" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl md:text-2xl font-extralight tracking-tight mt-5" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg md:text-xl font-light tracking-tight mt-4" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mt-3" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
              target={props.target ?? '_blank'}
              rel={props.rel ?? 'noopener noreferrer'}
              {...props}
            />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mt-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mt-2" {...props} />,
          li: ({ node, ...props }) => <li className="mt-1" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                {props.children}
              </table>
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-white/5" {...props} />,
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-sm font-medium border-b border-white/10" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 align-top border-b border-white/10" {...props} />
          ),
          input: ({ checked, ...props }) => (
            // task list checkbox (read-only)
            <input type="checkbox" checked={Boolean(checked)} readOnly className="mr-2 align-middle" {...props} />
          ),
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.9em]" {...props}>
                  {children}
                </code>
              );
            }
            const text = String(children ?? '');
            const langMatch = /language-([\w-]+)/.exec(className || '');
            const langRaw = (langMatch?.[1] || '').toLowerCase();
            const lang =
              {
                js: 'JavaScript',
                javascript: 'JavaScript',
                ts: 'TypeScript',
                typescript: 'TypeScript',
                tsx: 'TSX',
                jsx: 'JSX',
                json: 'JSON',
                bash: 'Bash',
                sh: 'Shell',
                zsh: 'Shell',
                yaml: 'YAML',
                yml: 'YAML',
                md: 'Markdown',
                markdown: 'Markdown',
                html: 'HTML',
                css: 'CSS',
                sql: 'SQL',
              }[langRaw] || (langRaw ? langRaw.toUpperCase() : undefined);
            const [copied, setCopied] = React.useState(false);
            const onCopy = async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
                show({ title: 'Copied to clipboard', description: lang ? `Code (${lang}) copied` : 'Code copied' });
              } catch {}
            };
            return (
              <div className="relative group">
                {lang ? (
                  <div className="absolute left-2 top-2 z-10 rounded-md border border-white/10 bg-black/60 px-2 py-0.5 text-xs text-gray-300">
                    {lang}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={onCopy}
                  className="absolute right-2 top-2 z-10 rounded-md border border-white/10 bg-black/60 px-2 py-1 text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <pre className="rounded-xl bg-black/60 ring-1 ring-white/10 p-4 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-white/15 pl-4 italic text-gray-300" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-6 border-white/10" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;

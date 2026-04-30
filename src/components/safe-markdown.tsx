'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || [])].filter(t => t !== 'script' && t !== 'style' && t !== 'iframe' && t !== 'form' && t !== 'input'),
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title'],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
  },
};

export function SafeMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[[rehypeSanitize, schema]]}
      className={className || 'prose-sm'}
      components={{
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-950 underline underline-offset-2 hover:text-gray-600 transition-colors"
            {...props}
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-gray-950">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside text-sm text-gray-700 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-gray-700 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => <p className="text-base font-semibold text-gray-950 mb-2">{children}</p>,
        h2: ({ children }) => <p className="text-base font-semibold text-gray-950 mb-2">{children}</p>,
        h3: ({ children }) => <p className="text-sm font-semibold text-gray-950 mb-1.5">{children}</p>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-200 pl-3 text-sm text-gray-500 italic mb-3">{children}</blockquote>,
        code: ({ children }) => <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-800">{children}</code>,
        pre: ({ children }) => <pre className="bg-gray-50 rounded-md p-3 overflow-x-auto text-xs mb-3">{children}</pre>,
        hr: () => <hr className="border-gray-100 my-4" />,
        img: () => null,
      }}
    />
  );
}

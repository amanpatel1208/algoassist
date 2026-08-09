import { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export default function FormattedMessage({ content, role }: FormattedMessageProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedBlockIndex, setCopiedBlockIndex] = useState<number | null>(null);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(content);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedBlockIndex(index);
    setTimeout(() => setCopiedBlockIndex(null), 2000);
  };

  // Helper to parse text into formatted markdown segments
  const renderFormattedText = (text: string) => {
    // Split by code blocks ```...```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        let language = 'code';

        // Check if first line specifies a language (e.g. ```python)
        if (lines.length > 0 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
          language = lines[0].trim();
          lines.shift();
        }

        const codeContent = lines.join('\n');

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-light-border dark:border-dark-border bg-[#1e1e2e] text-[#cdd6f4] shadow-md font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181825] border-b border-[#313244] text-[#a6adc8]">
              <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium">
                <Code2 className="w-3.5 h-3.5 text-brand" />
                <span className="capitalize">{language}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(codeContent, index)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#a6adc8] hover:text-white hover:bg-[#313244] transition-colors"
                title="Copy code"
              >
                {copiedBlockIndex === index ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code */}
            <pre className="p-3.5 overflow-x-auto leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Regular text (handle bold, inline code, lists, and line breaks)
      const paragraphs = part.split('\n');

      return (
        <div key={index} className="space-y-1.5">
          {paragraphs.map((line, pIdx) => {
            if (!line.trim()) return <div key={pIdx} className="h-1.5" />;

            const trimmed = line.trim();

            // Headings (###, ##, #)
            if (trimmed.startsWith('### ')) {
              return <h4 key={pIdx} className="text-sm font-bold text-light-text dark:text-dark-text mt-3 mb-1">{renderInlineFormatting(trimmed.substring(4))}</h4>;
            }
            if (trimmed.startsWith('## ')) {
              return <h3 key={pIdx} className="text-base font-bold text-light-text dark:text-dark-text mt-3 mb-1">{renderInlineFormatting(trimmed.substring(3))}</h3>;
            }
            if (trimmed.startsWith('# ')) {
              return <h2 key={pIdx} className="text-lg font-bold text-light-text dark:text-dark-text mt-4 mb-1">{renderInlineFormatting(trimmed.substring(2))}</h2>;
            }

            // Bullet list items
            const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
            const displayLine = isBullet ? trimmed.substring(2) : line;

            // Format inline elements: **bold** and `code`
            const formattedLine = renderInlineFormatting(displayLine);

            if (isBullet) {
              return (
                <div key={pIdx} className="flex items-start gap-2 ml-2 my-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                  <span className="flex-1">{formattedLine}</span>
                </div>
              );
            }

            return <p key={pIdx} className="leading-relaxed">{formattedLine}</p>;
          })}
        </div>
      );
    });
  };

  // Helper for inline markdown (**bold**, `inline code`)
  const renderInlineFormatting = (text: string) => {
    // Regex matches **bold** or `inline code`
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = text.split(regex);

    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-light-text dark:text-dark-text">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-brand font-medium">
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  return (
    <div className="relative group">
      {/* Copy button overlay in top right */}
      <button
        type="button"
        onClick={handleCopyMessage}
        className={`absolute top-0 right-0 p-1.5 rounded-md border text-xs transition-all opacity-0 group-hover:opacity-100 ${
          role === 'user'
            ? 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            : 'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
        }`}
        title="Copy entire message"
      >
        {copiedMessage ? (
          <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
            <Check className="w-3 h-3" /> Copied
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px]">
            <Copy className="w-3 h-3" /> Copy
          </span>
        )}
      </button>

      {/* Rendered content */}
      <div className="pr-12">
        {renderFormattedText(content)}
      </div>
    </div>
  );
}

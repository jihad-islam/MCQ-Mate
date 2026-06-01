import { BlockMath, InlineMath } from 'react-katex';

interface FormattedMathTextProps {
  text: string;
}

export function FormattedMathText({ text }: FormattedMathTextProps) {
  if (!text) return null;

  // Split the text by $ delimiters, keeping them to distinguish math from text
  // Using a regex that optionally captures double $$ for block math and single $ for inline math.
  // A simple approach is split by $$ for block math, then $ for inline math.
  
  // Regex to match block math $$...$$ or inline math $...$
  const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          return <BlockMath key={index} math={math} errorColor="#cc0000" renderError={(error) => <span className="text-rose-500 font-mono">{error.message}</span>} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <InlineMath key={index} math={math} errorColor="#cc0000" renderError={(error) => <span className="text-rose-500 font-mono">{error.message}</span>} />;
        } else {
          // Regular text block
          // Preserve newlines if needed using whitespace-pre-wrap
          return (
            <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
              {part}
            </span>
          );
        }
      })}
    </span>
  );
}

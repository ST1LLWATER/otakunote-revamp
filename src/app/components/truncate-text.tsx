import React, { useState, useEffect, useRef } from 'react';

interface TruncatedTitleProps {
  text: string;
  maxLines: number;
}

export default function TruncateText({
  text,
  maxLines = 2,
}: TruncatedTitleProps) {
  const [truncatedText, setTruncatedText] = useState(text);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const truncateText = () => {
      const container = containerRef.current;
      if (!container) return;

      const lineHeight = parseInt(
        window.getComputedStyle(container).lineHeight
      );
      const maxHeight = lineHeight * maxLines;

      if (container.scrollHeight > maxHeight) {
        let words = text.split(' ');
        let truncated = '';
        let i = 0;

        container.textContent = '';

        while (i < words.length) {
          let testText = truncated + (truncated ? ' ' : '') + words[i] + '...';
          container.textContent = testText;

          if (container.scrollHeight > maxHeight) {
            if (truncated) {
              setTruncatedText(truncated + '...');
            } else {
              // If even the first word doesn't fit, truncate the word
              setTruncatedText(words[0].slice(0, -3) + '...');
            }
            return;
          }

          truncated = truncated + (truncated ? ' ' : '') + words[i];
          i++;
        }

        setTruncatedText(text);
      } else {
        setTruncatedText(text);
      }
    };

    truncateText();
    window.addEventListener('resize', truncateText);

    return () => {
      window.removeEventListener('resize', truncateText);
    };
  }, [text, maxLines]);

  return (
    <div
      ref={containerRef}
      className="text-lg font-bold text-white leading-tight"
      style={{
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        display: '-webkit-box',
        overflow: 'hidden',
      }}
      title={text}
    >
      {truncatedText}
    </div>
  );
}

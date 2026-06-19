"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MermaidDiagram } from "./MermaidDiagram";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? "");
            const code = String(children).replace(/\n$/, "");

            if (match?.[1] === "mermaid") {
              return <MermaidDiagram chart={code} />;
            }

            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

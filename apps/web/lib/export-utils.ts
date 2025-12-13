/**
 * Export utilities for converting note content to various formats
 */

// TipTap JSON to plain text conversion
function jsonToPlainText(content: any): string {
  if (!content || !content.content) return "";

  function processNode(node: any): string {
    if (!node) return "";

    if (node.type === "text") {
      return node.text || "";
    }

    if (node.content && Array.isArray(node.content)) {
      const childContent = node.content.map(processNode).join("");

      switch (node.type) {
        case "paragraph":
          return childContent + "\n\n";
        case "heading":
          const level = node.attrs?.level || 1;
          return "#".repeat(level) + " " + childContent + "\n\n";
        case "bulletList":
        case "orderedList":
          return childContent + "\n";
        case "listItem":
          return "• " + childContent.trim() + "\n";
        case "taskList":
          return childContent + "\n";
        case "taskItem":
          const checked = node.attrs?.checked ? "[x]" : "[ ]";
          return checked + " " + childContent.trim() + "\n";
        case "blockquote":
          return (
            childContent
              .split("\n")
              .map((line: string) => (line ? "> " + line : ""))
              .join("\n") + "\n"
          );
        case "codeBlock":
          return "```\n" + childContent + "```\n\n";
        case "horizontalRule":
          return "\n---\n\n";
        default:
          return childContent;
      }
    }

    if (node.type === "horizontalRule") {
      return "\n---\n\n";
    }

    return "";
  }

  return processNode(content).trim();
}

// TipTap JSON to Markdown conversion
export function jsonToMarkdown(content: any, title?: string): string {
  if (!content || !content.content) return title ? `# ${title}\n\n` : "";

  let markdown = title ? `# ${title}\n\n` : "";
  let listCounter = 0;

  function processNode(node: any, depth: number = 0): string {
    if (!node) return "";

    if (node.type === "text") {
      let text = node.text || "";
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case "bold":
              text = `**${text}**`;
              break;
            case "italic":
              text = `*${text}*`;
              break;
            case "strike":
              text = `~~${text}~~`;
              break;
            case "code":
              text = `\`${text}\``;
              break;
            case "link":
              text = `[${text}](${mark.attrs?.href || ""})`;
              break;
            case "highlight":
              text = `==${text}==`;
              break;
            case "underline":
              text = `<u>${text}</u>`;
              break;
            case "subscript":
              text = `<sub>${text}</sub>`;
              break;
            case "superscript":
              text = `<sup>${text}</sup>`;
              break;
          }
        });
      }
      return text;
    }

    if (node.content && Array.isArray(node.content)) {
      const childContent = node.content
        .map((n: any) => processNode(n, depth))
        .join("");

      switch (node.type) {
        case "paragraph":
          return childContent + "\n\n";
        case "heading":
          const level = node.attrs?.level || 1;
          return "#".repeat(level) + " " + childContent + "\n\n";
        case "bulletList":
          listCounter = 0;
          return (
            node.content
              .map((item: any) => {
                const indent = "  ".repeat(depth);
                const itemContent = processNode(item, depth + 1);
                return indent + "- " + itemContent.trim();
              })
              .join("\n") + "\n\n"
          );
        case "orderedList":
          listCounter = 0;
          return (
            node.content
              .map((item: any, idx: number) => {
                const indent = "  ".repeat(depth);
                const itemContent = processNode(item, depth + 1);
                return indent + `${idx + 1}. ` + itemContent.trim();
              })
              .join("\n") + "\n\n"
          );
        case "listItem":
          return childContent;
        case "taskList":
          return (
            node.content
              .map((item: any) => {
                const checked = item.attrs?.checked ? "[x]" : "[ ]";
                const itemContent = processNode(item, depth);
                return `- ${checked} ` + itemContent.trim();
              })
              .join("\n") + "\n\n"
          );
        case "taskItem":
          return childContent;
        case "blockquote":
          return (
            childContent
              .split("\n")
              .filter((line: string) => line.trim())
              .map((line: string) => "> " + line)
              .join("\n") + "\n\n"
          );
        case "codeBlock":
          const language = node.attrs?.language || "";
          return "```" + language + "\n" + childContent + "```\n\n";
        case "horizontalRule":
          return "\n---\n\n";
        default:
          return childContent;
      }
    }

    if (node.type === "horizontalRule") {
      return "\n---\n\n";
    }

    return "";
  }

  markdown += processNode(content);
  return markdown.trim();
}

// TipTap JSON to HTML conversion
export function jsonToHtml(
  content: any,
  title?: string,
  includeStyles: boolean = true
): string {
  if (!content || !content.content) {
    return includeStyles
      ? getHtmlWrapper(
          title ? `<h1>${escapeHtml(title)}</h1>` : "",
          title,
          includeStyles
        )
      : title
        ? `<h1>${escapeHtml(title)}</h1>`
        : "";
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function processNode(node: any): string {
    if (!node) return "";

    if (node.type === "text") {
      let text = escapeHtml(node.text || "");
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case "bold":
              text = `<strong>${text}</strong>`;
              break;
            case "italic":
              text = `<em>${text}</em>`;
              break;
            case "strike":
              text = `<s>${text}</s>`;
              break;
            case "code":
              text = `<code>${text}</code>`;
              break;
            case "link":
              text = `<a href="${escapeHtml(mark.attrs?.href || "")}" target="_blank" rel="noopener noreferrer">${text}</a>`;
              break;
            case "highlight":
              const color = mark.attrs?.color || "#ffff00";
              text = `<mark style="background-color: ${color}">${text}</mark>`;
              break;
            case "underline":
              text = `<u>${text}</u>`;
              break;
            case "subscript":
              text = `<sub>${text}</sub>`;
              break;
            case "superscript":
              text = `<sup>${text}</sup>`;
              break;
          }
        });
      }
      return text;
    }

    if (node.content && Array.isArray(node.content)) {
      const childContent = node.content.map(processNode).join("");

      switch (node.type) {
        case "paragraph":
          const align = node.attrs?.textAlign;
          const alignStyle = align ? ` style="text-align: ${align}"` : "";
          return `<p${alignStyle}>${childContent}</p>`;
        case "heading":
          const level = node.attrs?.level || 1;
          const headAlign = node.attrs?.textAlign;
          const headAlignStyle = headAlign
            ? ` style="text-align: ${headAlign}"`
            : "";
          return `<h${level}${headAlignStyle}>${childContent}</h${level}>`;
        case "bulletList":
          return `<ul>${childContent}</ul>`;
        case "orderedList":
          return `<ol>${childContent}</ol>`;
        case "listItem":
          return `<li>${childContent}</li>`;
        case "taskList":
          return `<ul class="task-list">${childContent}</ul>`;
        case "taskItem":
          const checked = node.attrs?.checked ? "checked" : "";
          return `<li class="task-item"><input type="checkbox" ${checked} disabled />${childContent}</li>`;
        case "blockquote":
          return `<blockquote>${childContent}</blockquote>`;
        case "codeBlock":
          const language = node.attrs?.language || "";
          return `<pre><code class="language-${language}">${childContent}</code></pre>`;
        case "horizontalRule":
          return "<hr />";
        default:
          return childContent;
      }
    }

    if (node.type === "horizontalRule") {
      return "<hr />";
    }

    return "";
  }

  let html = title ? `<h1>${escapeHtml(title)}</h1>\n` : "";
  html += processNode(content);

  return includeStyles ? getHtmlWrapper(html, title, includeStyles) : html;
}

function getHtmlWrapper(
  content: string,
  title?: string,
  includeStyles: boolean = true
): string {
  const styles = includeStyles
    ? `
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background-color: #fff;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.3;
      }
      h1 { font-size: 2.25rem; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.3em; }
      h2 { font-size: 1.75rem; }
      h3 { font-size: 1.5rem; }
      p { margin: 1em 0; }
      ul, ol { padding-left: 2em; margin: 1em 0; }
      li { margin: 0.25em 0; }
      .task-list { list-style: none; padding-left: 0; }
      .task-item { display: flex; align-items: flex-start; gap: 0.5rem; }
      .task-item input { margin-top: 0.35em; }
      blockquote {
        border-left: 4px solid #e5e5e5;
        margin: 1em 0;
        padding: 0.5em 1em;
        color: #666;
        background-color: #f9f9f9;
      }
      pre {
        background-color: #f4f4f4;
        border-radius: 4px;
        padding: 1em;
        overflow-x: auto;
        font-size: 0.9em;
      }
      code {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        background-color: #f4f4f4;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
      }
      pre code {
        background-color: transparent;
        padding: 0;
      }
      a {
        color: #0066cc;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      hr {
        border: none;
        border-top: 1px solid #e5e5e5;
        margin: 2em 0;
      }
      mark {
        padding: 0.1em 0.2em;
        border-radius: 2px;
      }
      @media print {
        body { max-width: none; padding: 1cm; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
      }
    </style>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title ? title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "Exported Note"}</title>
  ${styles}
</head>
<body>
  ${content}
</body>
</html>`;
}

// Export to file functions
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(content: any, title: string) {
  const markdown = jsonToMarkdown(content, title);
  const filename = sanitizeFilename(title) + ".md";
  downloadFile(markdown, filename, "text/markdown");
}

export function exportToHtml(
  content: any,
  title: string,
  includeStyles: boolean = true
) {
  const html = jsonToHtml(content, title, includeStyles);
  const filename = sanitizeFilename(title) + ".html";
  downloadFile(html, filename, "text/html");
}

export async function exportToPdf(
  content: any,
  title: string,
  includeStyles: boolean = true
) {
  // Generate HTML content
  const html = jsonToHtml(content, title, includeStyles);

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Failed to open print window. Please allow pop-ups.");
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Close window after a small delay to ensure print dialog is shown
    setTimeout(() => {
      printWindow.close();
    }, 250);
  };
}

// Helper function to sanitize filenames
function sanitizeFilename(filename: string): string {
  return (
    filename
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 100) || "untitled"
  );
}

// Export format types
export type ExportFormat = "pdf" | "markdown" | "html";

export interface ExportOptions {
  format: ExportFormat;
  includeStyles?: boolean;
  title?: string;
}

export async function exportNote(
  content: any,
  title: string,
  options: ExportOptions
) {
  const { format, includeStyles = true } = options;

  switch (format) {
    case "pdf":
      await exportToPdf(content, title, includeStyles);
      break;
    case "markdown":
      exportToMarkdown(content, title);
      break;
    case "html":
      exportToHtml(content, title, includeStyles);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

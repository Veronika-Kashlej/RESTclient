'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './BodyEditor.sass';

export type BodyType = 'json' | 'text';

interface BodyEditorProps {
  bodyType: BodyType;
  bodyContent: string;
  onBodyTypeChange: (type: BodyType) => void;
  onBodyContentChange: (content: string) => void;
}

export default function BodyEditor({
  bodyType,
  bodyContent,
  onBodyTypeChange,
  onBodyContentChange,
}: BodyEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    const content = value || '';
    onBodyContentChange(content);

    if (bodyType === 'json' && content.trim()) {
      try {
        JSON.parse(content);
        setError(null);
      } catch {
        setError('Invalid JSON format');
      }
    } else {
      setError(null);
    }
  };

  const handlePrettify = () => {
    if (bodyType === 'json' && bodyContent.trim()) {
      try {
        const parsed = JSON.parse(bodyContent);
        const prettified = JSON.stringify(parsed, null, 2);
        onBodyContentChange(prettified);
        setError(null);
      } catch {
        setError('Cannot prettify invalid JSON');
      }
    }
  };

  const getEditorLanguage = () => {
    return bodyType === 'json' ? 'json' : 'plaintext';
  };

  return (
    <div className="body-editor">
      <div className="body-editor__header">
        <h3 className="body-editor__title">Request Body</h3>
        <div className="body-editor__controls">
          <div className="body-editor__type-toggle">
            <button
              className={`body-editor__type-btn ${bodyType === 'json' ? 'body-editor__type-btn--active' : ''}`}
              onClick={() => onBodyTypeChange('json')}
              data-testid="json-type-btn"
            >
              JSON
            </button>
            <button
              className={`body-editor__type-btn ${bodyType === 'text' ? 'body-editor__type-btn--active' : ''}`}
              onClick={() => onBodyTypeChange('text')}
              data-testid="text-type-btn"
            >
              Text
            </button>
          </div>
          {bodyType === 'json' && (
            <button
              className="body-editor__prettify-btn"
              onClick={handlePrettify}
              data-testid="prettify-btn"
            >
              Prettify
            </button>
          )}
        </div>
      </div>

      <div className="body-editor__editor-container">
        <Editor
          height="200px"
          language={getEditorLanguage()}
          value={bodyContent}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            renderLineHighlight: 'none',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
          }}
          data-testid="body-editor"
        />
      </div>

      {error && (
        <div className="body-editor__error" data-testid="body-editor-error">
          {error}
        </div>
      )}
    </div>
  );
}

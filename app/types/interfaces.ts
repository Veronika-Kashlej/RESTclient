export interface Header {
  className: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface MethodSelectorProps {
  selectedMethod: HttpMethod;
  onMethodChange: (method: HttpMethod) => void;
}

export interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  isValid: boolean;
  errorMessage?: string;
}

export interface HeaderItem {
  id: string;
  key: string;
  value: string;
}

export interface HeadersEditorProps {
  headers: HeaderItem[];
  onHeadersChange: (headers: HeaderItem[]) => void;
}

export interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

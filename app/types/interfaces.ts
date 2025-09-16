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

export interface RequestState {
  method: HttpMethod;
  url: string;
  headers: HeaderItem[];
  bodyType: 'json' | 'text';
  bodyContent: string;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
    time: number;
  } | null;
  error?: string | null;
}

export interface Variable {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariableFormData {
  key: string;
  value: string;
  description?: string;
}

export interface VariablesState {
  variables: Variable[];
  loading: boolean;
  error: string | null;
}

export interface AddVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: VariableFormData) => void;
  error?: string | null;
}

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

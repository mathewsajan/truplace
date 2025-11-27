export interface CompanyRequestFormData {
  company_name: string;
  company_website: string;
  email_domains: string[];
  industry: string;
  company_size: string;
  description: string;
  justification: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface DuplicateCompany {
  id: string;
  name: string;
  industry?: string;
  similarity: number;
}

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  helpText?: string;
}

export interface DomainInputProps {
  domains: string[];
  onChange: (domains: string[]) => void;
  error?: string;
  placeholder?: string;
}

export interface IndustrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export interface DuplicateWarningProps {
  duplicates: DuplicateCompany[];
  onDismiss: () => void;
  onUseExisting: (company: DuplicateCompany) => void;
  onContinueAnyway: () => void;
}
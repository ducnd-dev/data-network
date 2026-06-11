export type DocumentType =
  | "invoice"
  | "receipt"
  | "purchase_order"
  | "bank_statement"
  | "general"
  | "unknown";

export type ClassificationSource = "heuristic" | "llm" | "azure";

export type PipelineId =
  | "azure-invoice"
  | "azure-receipt"
  | "azure-bank-statement"
  | "layout-llm";

export type InvoiceLineItem = {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  confidence?: number;
};

export type ExtractedInvoice = {
  vendorName?: string;
  vendorAddress?: string;
  customerName?: string;
  customerAddress?: string;
  invoiceId?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  totalTax?: number;
  invoiceTotal?: number;
  currency?: string;
  lineItems: InvoiceLineItem[];
  confidenceScore: number;
};

export type ExtractedReceipt = {
  merchantName?: string;
  transactionDate?: string;
  transactionTime?: string;
  subtotal?: number;
  totalTax?: number;
  total?: number;
  currency?: string;
  lineItems: InvoiceLineItem[];
  confidenceScore: number;
};

export type ExtractedGeneral = {
  documentType: DocumentType;
  title?: string;
  summary?: string;
  fields: Record<string, string | number | null>;
  lineItems: InvoiceLineItem[];
  confidenceScore: number;
};

export type ExtractedDocument = ExtractedInvoice | ExtractedReceipt | ExtractedGeneral;

export type ClassificationResult = {
  documentType: DocumentType;
  confidence: number;
  source: ClassificationSource;
};

export type PipelineConfig = {
  id: PipelineId;
  azureModel: string;
  useLlm: boolean;
  creditMultiplier: number;
  allowedOnFree: boolean;
};

export type PipelineRunResult = {
  documentType: DocumentType;
  classification: ClassificationResult;
  pipeline: PipelineConfig;
  pageCount: number;
  creditsCharged: number;
  estimatedCogsAud: number;
  extracted: ExtractedDocument;
  raw: unknown;
  confidenceScore: number;
  llmTokensIn?: number;
  llmTokensOut?: number;
};

export type DocumentStatus =
  | "uploaded"
  | "classifying"
  | "processing"
  | "completed"
  | "failed";
export type OcrJobStatus = "pending" | "processing" | "completed" | "failed";

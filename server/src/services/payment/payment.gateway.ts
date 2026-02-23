export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  description: string;
  returnUrl: string;
  notifyUrl: string;
}

export interface PaymentResult {
  success: boolean;
  payUrl?: string;
  transactionId?: string;
  message?: string;
}

export interface CallbackResult {
  success: boolean;
  orderId: string;
  transactionId?: string;
  amount?: number;
}

export interface PaymentGateway {
  name: string;
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  verifyCallback(data: any): Promise<CallbackResult>;
  checkStatus(orderId: string): Promise<{ paid: boolean; transactionId?: string | undefined }>;
}

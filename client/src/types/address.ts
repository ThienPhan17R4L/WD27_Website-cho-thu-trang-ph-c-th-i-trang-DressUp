export type Address = {
  _id: string;
  userId: string;
  label: string;
  receiverName: string;
  receiverPhone: string;
  line1: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressPayload = {
  label: string;
  receiverName: string;
  receiverPhone: string;
  line1: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
};

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

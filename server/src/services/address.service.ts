import { AddressModel } from "../models/Address";
import { NotFoundError } from "../utils/errors";
import type { CreateAddressInput, UpdateAddressInput } from "../schemas/address.schema";

export const addressService = {
  async list(userId: string) {
    return AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  },

  async create(userId: string, data: CreateAddressInput) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
    }
    // If this is the first address, make it default
    const count = await AddressModel.countDocuments({ userId });
    if (count === 0) {
      data.isDefault = true;
    }

    return AddressModel.create({ userId, ...data } as any);
  },

  async update(userId: string, addressId: string, data: UpdateAddressInput) {
    if (data.isDefault) {
      await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
    }

    const address = await AddressModel.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!address) throw new NotFoundError("ADDRESS_NOT_FOUND", "Address not found");
    return address;
  },

  async remove(userId: string, addressId: string) {
    const address = await AddressModel.findOneAndDelete({ _id: addressId, userId });
    if (!address) throw new NotFoundError("ADDRESS_NOT_FOUND", "Address not found");

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const next = await AddressModel.findOne({ userId }).sort({ createdAt: -1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
    return { ok: true };
  },

  async setDefault(userId: string, addressId: string) {
    await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
    const address = await AddressModel.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: { isDefault: true } },
      { new: true }
    );
    if (!address) throw new NotFoundError("ADDRESS_NOT_FOUND", "Address not found");
    return address;
  },

  async getDefault(userId: string) {
    return AddressModel.findOne({ userId, isDefault: true });
  },
};

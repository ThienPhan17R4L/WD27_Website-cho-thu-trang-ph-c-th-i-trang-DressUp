import axiosInstance from "@/api/axios";

export type UploadResult = {
  url: string;
  publicId: string;
};

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await axiosInstance.post<{ data: UploadResult }>("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return (res.data as any).data ?? res.data;
}

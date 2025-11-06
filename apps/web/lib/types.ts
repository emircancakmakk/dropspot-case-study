export type Drop = {
  id: string;
  title: string;
  description?: string | null;
  stock: number;
  claimStart: string;
  claimEnd: string;
  isActive: boolean;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

// Tip tanımlamaları
export type SignInResponse = {
  accessToken: string;
  user: User;
};

export type SignUpResponse = {
  accessToken: string;
  user: User;
};

export type CreateDropInput = {
  title: string;
  description?: string;
  stock: number;
  claimStart: string;
  claimEnd: string;
  isActive: boolean;
};

export type CreateDropResponse = {
  message: string;
  drop: Drop;
};

export type UpdateDropResponse = {
  message: string;
  drop: Drop;
};

export type ActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

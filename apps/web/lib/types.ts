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

export type DropWithUserStatus = {
  id: string;
  title: string;
  description?: string | null;
  stock: number;
  claimStart: string;
  claimEnd: string;
  isActive: boolean;
  createdAt: string;
  userJoined: boolean;
  userClaimed: boolean;
}

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

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

export type WaitlistItem = {
  id: string;
  joinedAt: string;
  claimed: boolean;
  userId: string;
  dropId: string;
  priorityScore: number;
};

export type ClaimDropResponse = {
  status: "claimed" | "already_claimed";
  claimCode: string;
};

export type JoinDropResponse = {
  status: "joined" | "already_joined";
  wait: {
    id: string;
    userId: string;
    dropId: string;
    joinedAt: string;
  };
};

export type LeaveDropResponse = {
  status: "left" | "not_in_waitlist";
};

export type ClaimItem = {
  dropId: string;
  dropTitle: string;
  claimCode: string;
  claimAt: string;
  claimWindow: { start: string; end: string };
};

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DropActions from "./drop-actions";
import * as dropsActions from "@/actions/drops";

vi.mock("@/actions/drops", () => ({
  joinDropAction: vi.fn(),
  leaveDropAction: vi.fn(),
  claimDropAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("DropActions Component", () => {
  const mockDrop = {
    id: "drop-123",
    claimStart: new Date(Date.now() + 1000).toISOString(), // 1 saniye sonra
    claimEnd: new Date(Date.now() + 3600000).toISOString(), // 1 saat sonra
    stock: 10,
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render join button when not in waitlist", () => {
    render(<DropActions drop={mockDrop} initialInWaitlist={false} />);
    
    const joinButton = screen.getByRole("button", { name: /bekleme listesine katıl/i });
    expect(joinButton).toBeInTheDocument();
  });

  it("should render leave and claim buttons when in waitlist", () => {
    render(<DropActions drop={mockDrop} initialInWaitlist={true} />);
    
    const leaveButton = screen.getByRole("button", { name: /bekleme listesinden ayrıl/i });
    expect(leaveButton).toBeInTheDocument();
    
    const claimButton = screen.getByRole("button", { name: /claim kapalı/i });
    expect(claimButton).toBeInTheDocument();
    expect(claimButton).toBeDisabled();
  });

  it("should show claim code when claimed", async () => {
    const mockClaim = vi.mocked(dropsActions.claimDropAction);
    mockClaim.mockResolvedValue({
      status: "claimed",
      claimCode: "TEST-CODE-123",
    });

    render(
      <DropActions 
        drop={mockDrop} 
        initialInWaitlist={true} 
        initialClaimed={true}
      />
    );
    
    await waitFor(() => {
      const claimCodeLabel = screen.getByText(/claim kodun:/i);
      expect(claimCodeLabel).toBeInTheDocument();
    });
    
    await waitFor(() => {
      const claimCode = screen.getByText(/TEST-CODE-123/i);
      expect(claimCode).toBeInTheDocument();
    });
  });

  it("should call joinDropAction when join button is clicked", async () => {
    const user = userEvent.setup();
    const mockJoin = vi.mocked(dropsActions.joinDropAction);
    mockJoin.mockResolvedValue({
      status: "joined",
      wait: {
        id: "wait-123",
        userId: "user-123",
        dropId: "drop-123",
        joinedAt: new Date().toISOString(),
      },
    });

    render(<DropActions drop={mockDrop} initialInWaitlist={false} />);
    
    const joinButton = screen.getByRole("button", { name: /bekleme listesine katıl/i });
    await user.click(joinButton);

    await waitFor(() => {
      expect(mockJoin).toHaveBeenCalledWith("drop-123");
    });
  });

  it("should handle join error gracefully", async () => {
    const user = userEvent.setup();
    const mockJoin = vi.mocked(dropsActions.joinDropAction);
    mockJoin.mockRejectedValue(new Error("Network error"));

    render(<DropActions drop={mockDrop} initialInWaitlist={false} />);
    
    const joinButton = screen.getByRole("button", { name: /bekleme listesine katıl/i });
    await user.click(joinButton);

    await waitFor(() => {
      expect(mockJoin).toHaveBeenCalled();
    });
  });
});


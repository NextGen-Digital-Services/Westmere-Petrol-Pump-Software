"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Clock } from "lucide-react";

export const SessionTimeoutModal: React.FC = () => {
  const router = useRouter();
  const {
    isLoggedIn,
    lastActiveTimestamp,
    updateLastActive,
    logout,
    settings,
  } = usePetroStore();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const timeoutMinutes = settings.sessionTimeoutMinutes || 30;
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = Math.max(0, timeoutMs - 60 * 1000); // 1 minute before expiry

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    logout();
    router.push("/login");
  }, [logout, router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActiveTimestamp;

      if (elapsed >= timeoutMs) {
        handleLogout();
      } else if (elapsed >= warningMs) {
        setShowWarning(true);
        setSecondsRemaining(Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, lastActiveTimestamp, timeoutMs, warningMs, handleLogout]);

  // Activity listeners to refresh session
  useEffect(() => {
    if (!isLoggedIn) return;

    const onUserAction = () => {
      if (!showWarning) {
        updateLastActive();
      }
    };

    window.addEventListener("mousedown", onUserAction);
    window.addEventListener("keydown", onUserAction);
    return () => {
      window.removeEventListener("mousedown", onUserAction);
      window.removeEventListener("keydown", onUserAction);
    };
  }, [isLoggedIn, showWarning, updateLastActive]);

  const handleStayLoggedIn = () => {
    updateLastActive();
    setShowWarning(false);
  };

  return (
    <Modal
      isOpen={showWarning}
      onClose={handleLogout}
      title="Security Notice: Session Expiring"
      subtitle="Inactivity detected on station management terminal"
      maxWidth="sm"
    >
      <div className="space-y-4 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-warning/15 text-warning flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          For station security and financial compliance, your session will automatically terminate in{" "}
          <span className="font-bold text-text tabular-nums">{secondsRemaining} seconds</span> unless renewed.
        </p>

        <div className="flex items-center justify-center space-x-3 pt-3">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log Out Now
          </Button>
          <Button variant="primary" size="sm" onClick={handleStayLoggedIn}>
            Stay Logged In
          </Button>
        </div>
      </div>
    </Modal>
  );
};

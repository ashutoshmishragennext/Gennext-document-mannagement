"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  sendPhoneVerificationOTP,
  verifyPhoneOTP,
} from "@/actions/verification/phoneVerification";
import { PhoneInput } from "./input-phone";

interface PhoneVerificationProps {
  userId: string;
  initialPhone?: string;
  onVerificationComplete?: () => void;
}

export default function PhoneVerification({
  userId,
  initialPhone = "",
  onVerificationComplete,
}: PhoneVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(initialPhone);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSendOTP = async () => {
    console.log("PhoneVerification");

    if (!isValidPhoneNumber(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      console.log("try started");

      const result = await sendPhoneVerificationOTP(userId);

      if (result?.success) {
        setOtpSent(true);
        toast.success("Verification code sent to your phone number");
      } else {
        toast.error(result?.error || "Failed to send verification code");
      }
    } catch (error) {
      console.log(error);
      
      toast.error("An error occurred while sending the verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPhoneOTP(userId, phone, otp);

      if (result.success) {
        toast.success("Phone number verified successfully");
        onVerificationComplete?.();
        // Reset the form after successful verification
        setOtpSent(false);
        setOtp("");
      } else {
        toast.error(result.error || "Failed to verify code");
      }
    } catch (error) {
      console.log(error);
      
      toast.error("An error occurred while verifying the code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp("");
    await handleSendOTP();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg shadow-sm space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Phone Verification
      </h2>

      {!otpSent ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <PhoneInput
              value={phone}
              onChange={(value) => setPhone(value || "")}
              placeholder="Enter your phone number"
              defaultCountry="IN"
              className="w-full"
            />
          </div>

          <Button
            onClick={handleSendOTP}
            disabled={loading || !isValidPhoneNumber(phone)}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Enter the 6-digit verification code sent to {phone}
            </p>

            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              className="w-full justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full"
            >
              Resend Code
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

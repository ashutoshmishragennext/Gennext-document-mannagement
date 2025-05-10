import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

function ForgotPasswordPage() {
  return (
    <div className="mt-3 flex items-center">
      <div className="flex-grow">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

import LoginForm from "@/components/form/auth/LoginForm";

function LoginPage() {
  return (
    <div className="mt-3 flex items-center">
      <div className="flex-grow">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;

import { LoginForm } from "@/components/auth/login-form";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();

  const handleLoginSuccess = () => {
    setLocation("/admin");
  };

  const handleShowPublic = () => {
    setLocation("/");
  };

  return (
    <LoginForm 
      onSuccess={handleLoginSuccess}
      onShowPublic={handleShowPublic}
    />
  );
}

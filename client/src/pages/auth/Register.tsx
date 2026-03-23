import { useEffect } from "react";
import { useLocation } from "wouter";

// Google OAuth 不需要獨立的註冊頁，直接導到登入頁
export default function Register() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate("/auth/login"); }, [navigate]);
  return null;
}

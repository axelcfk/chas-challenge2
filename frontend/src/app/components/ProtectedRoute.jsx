import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, checkAuth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      await checkAuth();
      setLoading(false);
      if (!isLoggedIn) {
        router.push("/");
      }
    };

    checkAuthentication();
  }, [isLoggedIn, router, checkAuth]);

  if (loading) {
    return <div className="bg-black">Loading...</div>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return children;
};

export default ProtectedRoute;

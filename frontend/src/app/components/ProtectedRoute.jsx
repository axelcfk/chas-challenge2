import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, checkAuth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
            if (!isLoggedIn) {
                router.push("/");
        }
    };

        checkAuthentication();
    }, [isLoggedIn, router])

    if (!isLoggedIn) {
        return null; //eller ladda till en laddningsgrej för att kolla om man 
                    // är inloggad eller inte.
    }

    return children;
};

export default ProtectedRoute;
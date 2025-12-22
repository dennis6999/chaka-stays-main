import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                try {
                    const adminStatus = await api.isAdmin(user.id);
                    setIsAdmin(adminStatus);
                    if (!adminStatus) {
                        toast.error("Unauthorized Access");
                    }
                } catch (error) {
                    console.error("Admin check failed", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        if (!loading) {
            checkAdmin();
        }
    }, [user, loading]);

    if (loading || isAdmin === null) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;

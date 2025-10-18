import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminLogin() {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Checking authorization...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            {isAdmin ? (
              <>
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                Admin Authenticated
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                Access Denied
              </>
            )}
          </CardTitle>
          <CardDescription className="text-sm">
            {isAdmin 
              ? "You have admin privileges" 
              : "You don't have admin access. Contact the system administrator to get admin role."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

import { Button } from "./ui/button";
import { getUser } from "@/lib/auth0";

export async function UserNav() {
    const user = await getUser();

    if (!user) {
        return (
            <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                    <a href="/api/auth/login">Login</a>
                </Button>
                <Button asChild>
                    <a href="/api/auth/signup">Sign Up</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" asChild>
                <a href="/auth/logout">Logout</a>
            </Button>
        </div>
    );
} 
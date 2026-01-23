import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export function useAuthUser() {
  const { user, isAuthenticated, isLoading, getToken, logout } =
    useKindeAuth();

  return {
    isAuthenticated,
    isLoading,
    user: user
      ? {
          id: user.id,
          email: user.email,
          firstName: user.givenName,
          lastName: user.familyName,
          picture: user.picture,
        }
      : null,
    getToken,
    logout,
  };
}

export function useAuth() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return {
    user,
    role: user?.role,
    token: user?.token,
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "USER" | "PRODUCER";
  profileImage?: string | null;
}

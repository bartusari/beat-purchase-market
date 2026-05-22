import type { User } from "./user";

export interface Producer extends User {
  role: "PRODUCER";
  beats?: Array<{ id: string; coverUrl: string; title: string }>;
}

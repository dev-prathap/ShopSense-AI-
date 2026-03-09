import "server-only";

import { UserRole } from "@prisma/client";

const rank: Record<UserRole, number> = {
  OWNER: 2,
  STAFF: 1
};

export function canAccessRole(actual: UserRole, required: UserRole): boolean {
  return rank[actual] >= rank[required];
}

import { User, UserRole, Role } from '@prisma/client';
import { AuthenticatedUser } from '../types/authenticated-user.interface';

type UserWithRoles = User & {
  roles: (UserRole & { role: Role })[];
};

export function sanitizeUser(user: UserWithRoles): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    preferredName: user.preferredName,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.roles.map((userRole) => userRole.role.name),
  };
}

import { User, UserRole, Role } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';
type UserWithRoles = User & {
    roles: (UserRole & {
        role: Role;
    })[];
};
export declare function sanitizeUser(user: UserWithRoles): AuthenticatedUser;
export {};

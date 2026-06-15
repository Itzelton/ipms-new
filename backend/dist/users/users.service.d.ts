import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRepository } from './repositories/user.repository';
import { sanitizeUser } from './utils/sanitize-user.util';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    create(createUserDto: CreateUserDto): Promise<{
        roles: ({
            role: {
                id: string;
                createdAt: Date;
                name: import(".prisma/client").$Enums.RoleName;
                description: string | null;
            };
        } & {
            id: string;
            assignedAt: Date;
            roleId: string;
            userId: string;
        })[];
    } & {
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        preferredName: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        departmentId: string | null;
        cohortId: string | null;
    }>;
    findAll(pagination: PaginationDto): Promise<AuthenticatedUser[]>;
    findOne(id: string): Promise<({
        roles: ({
            role: {
                id: string;
                createdAt: Date;
                name: import(".prisma/client").$Enums.RoleName;
                description: string | null;
            };
        } & {
            id: string;
            assignedAt: Date;
            roleId: string;
            userId: string;
        })[];
    } & {
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        preferredName: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        departmentId: string | null;
        cohortId: string | null;
    }) | null>;
    findByEmail(email: string): Promise<({
        roles: ({
            role: {
                id: string;
                createdAt: Date;
                name: import(".prisma/client").$Enums.RoleName;
                description: string | null;
            };
        } & {
            id: string;
            assignedAt: Date;
            roleId: string;
            userId: string;
        })[];
    } & {
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        preferredName: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        departmentId: string | null;
        cohortId: string | null;
    }) | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<AuthenticatedUser>;
    remove(id: string): Promise<AuthenticatedUser>;
    sanitizeUser(user: Parameters<typeof sanitizeUser>[0]): AuthenticatedUser;
}

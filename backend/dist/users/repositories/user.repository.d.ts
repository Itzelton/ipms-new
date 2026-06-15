import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserDto): Promise<{
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
    findAll(pagination: PaginationDto): Promise<({
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
    })[]>;
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
    update(id: string, data: UpdateUserDto): Promise<{
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
    remove(id: string): Promise<{
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
}

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(pagination: PaginationDto): Promise<import("../auth/types/authenticated-user.interface").AuthenticatedUser[]>;
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
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../auth/types/authenticated-user.interface").AuthenticatedUser>;
    remove(id: string): Promise<import("../auth/types/authenticated-user.interface").AuthenticatedUser>;
}

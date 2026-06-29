import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UserRepository {
    private readonly prisma;
    private readonly useInMemoryData;
    private readonly inMemoryUsers;
    constructor(prisma: PrismaService);
    private findInMemoryUserByEmail;
    private findInMemoryUserById;
    create(data: CreateUserDto): Promise<any>;
    findAll(pagination: PaginationDto): Promise<({
        id: `${string}-${string}-${string}-${string}-${string}`;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        preferredName: string;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            role: {
                name: "STUDENT";
            };
        }[];
    } | {
        id: `${string}-${string}-${string}-${string}-${string}`;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        preferredName: string;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            role: {
                name: "SUPERVISOR";
            };
        }[];
    } | {
        id: `${string}-${string}-${string}-${string}-${string}`;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        preferredName: string;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            role: {
                name: "ADMIN";
            };
        }[];
    })[] | ({
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
        email: string;
        password: string;
        preferredName: string | null;
        firstName: string | null;
        lastName: string | null;
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        departmentId: string | null;
        cohortId: string | null;
    })[]>;
    findOne(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    update(id: string, data: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<any>;
}

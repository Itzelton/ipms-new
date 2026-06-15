import { RoleName } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    role: RoleName;
    preferredName?: string;
    firstName?: string;
    lastName?: string;
}

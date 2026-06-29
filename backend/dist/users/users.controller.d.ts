import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(pagination: PaginationDto): Promise<import("../common/types/authenticated-user.interface").AuthenticatedUser[]>;
    findOne(id: string): Promise<any>;
    create(createUserDto: CreateUserDto): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../common/types/authenticated-user.interface").AuthenticatedUser>;
    remove(id: string): Promise<import("../common/types/authenticated-user.interface").AuthenticatedUser>;
}

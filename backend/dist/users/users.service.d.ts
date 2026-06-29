import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRepository } from './repositories/user.repository';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    create(createUserDto: CreateUserDto): Promise<any>;
    findAll(pagination: PaginationDto): Promise<AuthenticatedUser[]>;
    findOne(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<AuthenticatedUser>;
    remove(id: string): Promise<AuthenticatedUser>;
    sanitizeUser(user: any): AuthenticatedUser;
}

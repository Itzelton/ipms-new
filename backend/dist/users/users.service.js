"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("./repositories/user.repository");
const sanitize_user_util_1 = require("../common/utils/sanitize-user.util");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        return this.userRepository.create(createUserDto);
    }
    async findAll(pagination) {
        const users = await this.userRepository.findAll(pagination);
        return users.map((user) => this.sanitizeUser(user));
    }
    async findOne(id) {
        return this.userRepository.findOne(id);
    }
    async findByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    async update(id, updateUserDto) {
        const user = await this.userRepository.update(id, updateUserDto);
        return this.sanitizeUser(user);
    }
    async remove(id) {
        const user = await this.userRepository.remove(id);
        return this.sanitizeUser(user);
    }
    sanitizeUser(user) {
        return (0, sanitize_user_util_1.sanitizeUser)(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], UsersService);

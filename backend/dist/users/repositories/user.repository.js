"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const userWithRolesInclude = {
    roles: {
        include: {
            role: true,
        },
    },
};
const mockUsers = [
    {
        id: (0, crypto_1.randomUUID)(),
        email: 'student@example.com',
        password: bcrypt.hashSync('student123', 10),
        firstName: 'Student',
        lastName: 'Example',
        preferredName: 'Student',
        phone: '555-0100',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [{ role: { name: client_1.RoleName.STUDENT } }],
    },
    {
        id: (0, crypto_1.randomUUID)(),
        email: 'supervisor@example.com',
        password: bcrypt.hashSync('supervisor123', 10),
        firstName: 'Supervisor',
        lastName: 'Example',
        preferredName: 'Supervisor',
        phone: '555-0101',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [{ role: { name: client_1.RoleName.SUPERVISOR } }],
    },
    {
        id: (0, crypto_1.randomUUID)(),
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 10),
        firstName: 'Admin',
        lastName: 'Example',
        preferredName: 'Admin',
        phone: '555-0102',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [{ role: { name: client_1.RoleName.ADMIN } }],
    },
];
let UserRepository = class UserRepository {
    prisma;
    useInMemoryData = !process.env.DATABASE_URL;
    inMemoryUsers = [...mockUsers];
    constructor(prisma) {
        this.prisma = prisma;
    }
    findInMemoryUserByEmail(email) {
        return this.inMemoryUsers.find((user) => user.email === email);
    }
    findInMemoryUserById(id) {
        return this.inMemoryUsers.find((user) => user.id === id);
    }
    async create(data) {
        if (this.useInMemoryData) {
            const user = {
                id: (0, crypto_1.randomUUID)(),
                ...data,
                password: bcrypt.hashSync(data.password, 10),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                roles: [{ role: { name: data.role } }],
            };
            this.inMemoryUsers.push(user);
            return user;
        }
        const { role, ...userData } = data;
        return this.prisma.user.create({
            data: {
                ...userData,
                roles: {
                    create: {
                        role: {
                            connectOrCreate: {
                                where: { name: role },
                                create: { name: role },
                            },
                        },
                    },
                },
            },
            include: userWithRolesInclude,
        });
    }
    async findAll(pagination) {
        if (this.useInMemoryData) {
            const take = pagination.limit || 20;
            const skip = pagination.page ? (pagination.page - 1) * take : 0;
            return this.inMemoryUsers.slice(skip, skip + take);
        }
        const take = pagination.limit || 20;
        const skip = pagination.page ? (pagination.page - 1) * take : 0;
        return this.prisma.user.findMany({
            skip,
            take,
            include: userWithRolesInclude,
        });
    }
    async findOne(id) {
        if (this.useInMemoryData) {
            return this.findInMemoryUserById(id);
        }
        return this.prisma.user.findUnique({
            where: { id },
            include: userWithRolesInclude,
        });
    }
    async findByEmail(email) {
        if (this.useInMemoryData) {
            return this.findInMemoryUserByEmail(email);
        }
        return this.prisma.user.findUnique({
            where: { email },
            include: userWithRolesInclude,
        });
    }
    async update(id, data) {
        if (this.useInMemoryData) {
            const user = this.findInMemoryUserById(id);
            if (!user) {
                return null;
            }
            Object.assign(user, data, { updatedAt: new Date() });
            return user;
        }
        return this.prisma.user.update({
            where: { id },
            data,
            include: userWithRolesInclude,
        });
    }
    async remove(id) {
        if (this.useInMemoryData) {
            const index = this.inMemoryUsers.findIndex((user) => user.id === id);
            if (index === -1) {
                return null;
            }
            const [removed] = this.inMemoryUsers.splice(index, 1);
            return removed;
        }
        return this.prisma.user.delete({
            where: { id },
            include: userWithRolesInclude,
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserRepository);

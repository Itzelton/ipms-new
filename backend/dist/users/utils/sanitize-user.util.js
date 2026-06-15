"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = sanitizeUser;
function sanitizeUser(user) {
    const { password: _, roles, ...rest } = user;
    return {
        ...rest,
        roles: roles.map((userRole) => userRole.role.name),
    };
}

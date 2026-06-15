"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET || 'CHANGE_ME_REPLACE_IN_PROD',
    expiresIn: '1h',
};

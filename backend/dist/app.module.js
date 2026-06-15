"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const projects_module_1 = require("./projects/projects.module");
const milestones_module_1 = require("./milestones/milestones.module");
const submissions_module_1 = require("./submissions/submissions.module");
const discussions_module_1 = require("./discussions/discussions.module");
const notifications_module_1 = require("./notifications/notifications.module");
const analytics_module_1 = require("./analytics/analytics.module");
const ai_module_1 = require("./ai/ai.module");
const reports_module_1 = require("./reports/reports.module");
const audit_module_1 = require("./audit/audit.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['../.env.local', '.env.local', '.env'],
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            projects_module_1.ProjectsModule,
            milestones_module_1.MilestonesModule,
            submissions_module_1.SubmissionsModule,
            discussions_module_1.DiscussionsModule,
            notifications_module_1.NotificationsModule,
            analytics_module_1.AnalyticsModule,
            ai_module_1.AiModule,
            reports_module_1.ReportsModule,
            audit_module_1.AuditModule,
        ],
    })
], AppModule);

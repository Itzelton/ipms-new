"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestonesModule = void 0;
const common_1 = require("@nestjs/common");
const milestones_controller_1 = require("./milestones.controller");
const milestones_service_1 = require("./milestones.service");
const milestone_repository_1 = require("./repositories/milestone.repository");
const notifications_module_1 = require("../notifications/notifications.module");
const audit_module_1 = require("../audit/audit.module");
let MilestonesModule = class MilestonesModule {
};
exports.MilestonesModule = MilestonesModule;
exports.MilestonesModule = MilestonesModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule, audit_module_1.AuditModule],
        controllers: [milestones_controller_1.MilestonesController],
        providers: [milestones_service_1.MilestonesService, milestone_repository_1.MilestoneRepository],
        exports: [milestones_service_1.MilestonesService],
    })
], MilestonesModule);

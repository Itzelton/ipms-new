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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestonesController = void 0;
const common_1 = require("@nestjs/common");
const milestones_service_1 = require("./milestones.service");
const create_milestone_dto_1 = require("./dto/create-milestone.dto");
const update_milestone_dto_1 = require("./dto/update-milestone.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let MilestonesController = class MilestonesController {
    milestonesService;
    constructor(milestonesService) {
        this.milestonesService = milestonesService;
    }
    findAll(pagination) {
        return this.milestonesService.findAll(pagination);
    }
    findOne(id) {
        return this.milestonesService.findOne(id);
    }
    create(createMilestoneDto) {
        return this.milestonesService.create(createMilestoneDto);
    }
    update(id, updateMilestoneDto) {
        return this.milestonesService.update(id, updateMilestoneDto);
    }
    remove(id) {
        return this.milestonesService.remove(id);
    }
};
exports.MilestonesController = MilestonesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], MilestonesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MilestonesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_milestone_dto_1.CreateMilestoneDto]),
    __metadata("design:returntype", void 0)
], MilestonesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_milestone_dto_1.UpdateMilestoneDto]),
    __metadata("design:returntype", void 0)
], MilestonesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MilestonesController.prototype, "remove", null);
exports.MilestonesController = MilestonesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('milestones'),
    __metadata("design:paramtypes", [milestones_service_1.MilestonesService])
], MilestonesController);

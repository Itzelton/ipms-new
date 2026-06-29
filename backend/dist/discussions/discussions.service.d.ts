import { CreateDiscussionThreadDto } from './dto/create-discussion-thread.dto';
import { CreateDiscussionMessageDto } from './dto/create-discussion-message.dto';
import { UpdateDiscussionThreadDto } from './dto/update-discussion-thread.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DiscussionRepository } from './repositories/discussion.repository';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DiscussionsService {
    private readonly discussionRepository;
    private readonly notificationsService;
    constructor(discussionRepository: DiscussionRepository, notificationsService: NotificationsService);
    findAll(pagination: PaginationDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: string;
        updatedAt: Date;
        submissionId: string | null;
        createdById: string;
    }[]>;
    findOne(id: string): Promise<({
        project: {
            id: string;
            type: import(".prisma/client").$Enums.ProjectType;
            title: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ProjectStatus;
            updatedAt: Date;
            studentProfileId: string | null;
            description: string | null;
            startDate: Date | null;
            expectedEndDate: Date | null;
            actualEndDate: Date | null;
            studentId: string | null;
            supervisorId: string | null;
            supervisorProfileId: string | null;
            departmentId: string | null;
            cohortId: string | null;
        };
        submission: ({
            author: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                departmentId: string | null;
                cohortId: string | null;
                email: string;
                password: string;
                firstName: string | null;
                lastName: string | null;
                preferredName: string | null;
                phone: string | null;
                isActive: boolean;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            projectId: string;
            content: string;
            evidenceType: import(".prisma/client").$Enums.EvidenceType | null;
            fileUrl: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            grade: number | null;
            feedback: string | null;
            submittedAt: Date;
            updatedAt: Date;
            milestoneId: string | null;
            authorId: string;
            studentProfileId: string | null;
        }) | null;
        messages: ({
            author: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                departmentId: string | null;
                cohortId: string | null;
                email: string;
                password: string;
                firstName: string | null;
                lastName: string | null;
                preferredName: string | null;
                phone: string | null;
                isActive: boolean;
                deletedAt: Date | null;
            };
            replies: ({
                author: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    departmentId: string | null;
                    cohortId: string | null;
                    email: string;
                    password: string;
                    firstName: string | null;
                    lastName: string | null;
                    preferredName: string | null;
                    phone: string | null;
                    isActive: boolean;
                    deletedAt: Date | null;
                };
            } & {
                id: string;
                createdAt: Date;
                content: string;
                authorId: string;
                threadId: string;
                parentMessageId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            threadId: string;
            parentMessageId: string | null;
        })[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: string;
        updatedAt: Date;
        submissionId: string | null;
        createdById: string;
    }) | null>;
    findBySubmission(submissionId: string): Promise<({
        project: {
            id: string;
            type: import(".prisma/client").$Enums.ProjectType;
            title: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ProjectStatus;
            updatedAt: Date;
            studentProfileId: string | null;
            description: string | null;
            startDate: Date | null;
            expectedEndDate: Date | null;
            actualEndDate: Date | null;
            studentId: string | null;
            supervisorId: string | null;
            supervisorProfileId: string | null;
            departmentId: string | null;
            cohortId: string | null;
        };
        submission: {
            id: string;
            createdAt: Date;
            projectId: string;
            content: string;
            evidenceType: import(".prisma/client").$Enums.EvidenceType | null;
            fileUrl: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            grade: number | null;
            feedback: string | null;
            submittedAt: Date;
            updatedAt: Date;
            milestoneId: string | null;
            authorId: string;
            studentProfileId: string | null;
        } | null;
        messages: ({
            author: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                departmentId: string | null;
                cohortId: string | null;
                email: string;
                password: string;
                firstName: string | null;
                lastName: string | null;
                preferredName: string | null;
                phone: string | null;
                isActive: boolean;
                deletedAt: Date | null;
            };
            replies: ({
                author: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    departmentId: string | null;
                    cohortId: string | null;
                    email: string;
                    password: string;
                    firstName: string | null;
                    lastName: string | null;
                    preferredName: string | null;
                    phone: string | null;
                    isActive: boolean;
                    deletedAt: Date | null;
                };
            } & {
                id: string;
                createdAt: Date;
                content: string;
                authorId: string;
                threadId: string;
                parentMessageId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            threadId: string;
            parentMessageId: string | null;
        })[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: string;
        updatedAt: Date;
        submissionId: string | null;
        createdById: string;
    }) | null>;
    createThread(dto: CreateDiscussionThreadDto & {
        createdById: string;
    }): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: string;
        updatedAt: Date;
        submissionId: string | null;
        createdById: string;
    }>;
    createMessage(threadId: string, dto: CreateDiscussionMessageDto & {
        authorId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        threadId: string;
        parentMessageId: string | null;
    }>;
    updateThread(id: string, dto: UpdateDiscussionThreadDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: string;
        updatedAt: Date;
        submissionId: string | null;
        createdById: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: string;
        updatedAt: Date;
        submissionId: string | null;
        createdById: string;
    }>;
}

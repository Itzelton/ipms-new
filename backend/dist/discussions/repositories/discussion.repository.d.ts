import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDiscussionThreadDto } from '../dto/create-discussion-thread.dto';
import { CreateDiscussionMessageDto } from '../dto/create-discussion-message.dto';
import { UpdateDiscussionThreadDto } from '../dto/update-discussion-thread.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class DiscussionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(pagination: PaginationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        submissionId: string | null;
        title: string;
        createdById: string;
        status: string;
    }[]>;
    findOne(id: string): Promise<({
        project: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            departmentId: string | null;
            cohortId: string | null;
            description: string | null;
            title: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            studentProfileId: string | null;
            supervisorId: string | null;
            type: import(".prisma/client").$Enums.ProjectType;
            startDate: Date | null;
            expectedEndDate: Date | null;
            actualEndDate: Date | null;
            studentId: string | null;
            supervisorProfileId: string | null;
        };
        submission: ({
            author: {
                id: string;
                email: string;
                password: string;
                firstName: string | null;
                lastName: string | null;
                preferredName: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                departmentId: string | null;
                cohortId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            authorId: string;
            content: string;
            milestoneId: string | null;
            studentProfileId: string | null;
            evidenceType: import(".prisma/client").$Enums.EvidenceType | null;
            fileUrl: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            grade: number | null;
            feedback: string | null;
            submittedAt: Date;
        }) | null;
        messages: ({
            author: {
                id: string;
                email: string;
                password: string;
                firstName: string | null;
                lastName: string | null;
                preferredName: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                departmentId: string | null;
                cohortId: string | null;
            };
            replies: ({
                author: {
                    id: string;
                    email: string;
                    password: string;
                    firstName: string | null;
                    lastName: string | null;
                    preferredName: string | null;
                    phone: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    departmentId: string | null;
                    cohortId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                threadId: string;
                authorId: string;
                content: string;
                parentMessageId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            threadId: string;
            authorId: string;
            content: string;
            parentMessageId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        submissionId: string | null;
        title: string;
        createdById: string;
        status: string;
    }) | null>;
    createThread(data: CreateDiscussionThreadDto & {
        createdById?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        submissionId: string | null;
        title: string;
        createdById: string;
        status: string;
    }>;
    findBySubmission(submissionId: string): Promise<({
        project: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            departmentId: string | null;
            cohortId: string | null;
            description: string | null;
            title: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            studentProfileId: string | null;
            supervisorId: string | null;
            type: import(".prisma/client").$Enums.ProjectType;
            startDate: Date | null;
            expectedEndDate: Date | null;
            actualEndDate: Date | null;
            studentId: string | null;
            supervisorProfileId: string | null;
        };
        submission: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            authorId: string;
            content: string;
            milestoneId: string | null;
            studentProfileId: string | null;
            evidenceType: import(".prisma/client").$Enums.EvidenceType | null;
            fileUrl: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            grade: number | null;
            feedback: string | null;
            submittedAt: Date;
        } | null;
        messages: ({
            author: {
                id: string;
                email: string;
                password: string;
                firstName: string | null;
                lastName: string | null;
                preferredName: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                departmentId: string | null;
                cohortId: string | null;
            };
            replies: ({
                author: {
                    id: string;
                    email: string;
                    password: string;
                    firstName: string | null;
                    lastName: string | null;
                    preferredName: string | null;
                    phone: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    departmentId: string | null;
                    cohortId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                threadId: string;
                authorId: string;
                content: string;
                parentMessageId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            threadId: string;
            authorId: string;
            content: string;
            parentMessageId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        submissionId: string | null;
        title: string;
        createdById: string;
        status: string;
    }) | null>;
    createMessage(threadId: string, data: CreateDiscussionMessageDto & {
        authorId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        threadId: string;
        authorId: string;
        content: string;
        parentMessageId: string | null;
    }>;
    findUsersByMentionKeys(mentionKeys: string[]): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        preferredName: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        departmentId: string | null;
        cohortId: string | null;
    }[]>;
    updateThread(id: string, data: UpdateDiscussionThreadDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        submissionId: string | null;
        title: string;
        createdById: string;
        status: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        submissionId: string | null;
        title: string;
        createdById: string;
        status: string;
    }>;
}

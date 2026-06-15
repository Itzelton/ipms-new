export declare enum EvidenceType {
    DOCUMENT = "DOCUMENT",
    GITHUB = "GITHUB",
    WEBSITE = "WEBSITE",
    APK = "APK",
    SCREENSHOT = "SCREENSHOT",
    DEMO_VIDEO = "DEMO_VIDEO",
    MEETING_RECORD = "MEETING_RECORD"
}
export declare class CreateSubmissionDto {
    projectId: string;
    milestoneId: string;
    content: string;
    evidenceType?: EvidenceType;
    fileUrl?: string;
    metadata?: any;
    status?: string;
}

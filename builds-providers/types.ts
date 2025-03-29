export interface BuildStatus {
    name: string;
    state: BuildState;
    url: string;

    // GitLab Specific
    pipelineUrl?: string;
}

export type BuildState =
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'INPROGRESS'
    | 'UNKNOWN'
    | 'SKIPPED'
    | 'CANCELLED'
    | 'PENDING';

export interface BuildsResults extends Array<BuildStatus> {
    // GitLab Specific
    pipelineUrl?: string;
}

interface BuildsProviderParams {
    branchName: string;
    commitHash: string;
    remoteUrl: URL;
}

export type BuildsProvider = ({
    commitHash,
    branchName,
    remoteUrl,
}: BuildsProviderParams) => Promise<BuildsResults>;

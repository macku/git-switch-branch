export interface BuildStatus {
    name: string;
    state: BuildState;
    url: string;
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
    pipelineUrl?: string;
}

interface BuildsProviderParams {
    commitHash: string;
    remoteUrl: string;
}

export type BuildsProvider = ({
    commitHash,
    remoteUrl,
}: BuildsProviderParams) => Promise<BuildsResults>;

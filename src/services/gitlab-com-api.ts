import * as assert from 'node:assert';
import { fetch } from 'zx';
import type { BuildState, BuildsResults } from '../builds-providers/types.ts';
import './user-config.ts';

interface GitlabPipelineStatus {
    id: string;
    name: string;
    status: string;
    pipeline_id: string;
}

const gitlabWebUrl = `https://gitlab.com/`;
const baseUrl = `https://gitlab.com/api/v4`;

const getProjectIdFromUrl = (url: URL): string => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return encodeURIComponent(parts.join('/'));
};

const getProjectAndRepoFromUrl = (url: URL): string => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return parts.slice(0, 2).join('/');
};

const getPipelineJobUrl = (remoteUrl: URL, jobId: string): string => {
    const projectAndRepoParts = getProjectAndRepoFromUrl(remoteUrl);

    return `${gitlabWebUrl}/${projectAndRepoParts}/-/jobs/${jobId}`;
};

const getPipelineUrl = (remoteUrl: URL, pipelineId: string): string => {
    const projectAndRepoParts = getProjectAndRepoFromUrl(remoteUrl);

    return `${gitlabWebUrl}/${projectAndRepoParts}/-/pipelines/${pipelineId}`;
};

const getAuthKey = (): string => {
    assert.ok(
        process.env.GITLAB_TOKEN,
        'The "GITLAB_TOKEN" value is missing. You need to create the ~/.atl-config file and provide a valid token'
    );

    return process.env.GITLAB_TOKEN;
};

/**
 * Maps GitLab pipeline status to our BuildState format
 */
const mapGitlabPipelineBuildState = (state: string): BuildState => {
    switch (state) {
        case 'success':
            return 'SUCCESSFUL';
        case 'pending':
        case 'created':
            return 'PENDING';
        case 'failed':
            return 'FAILED';
        case 'running':
            return 'INPROGRESS';
        case 'canceled':
            return 'CANCELLED';
        case 'skipped':
            return 'SKIPPED';
        default:
            return 'UNKNOWN';
    }
};

/**
 * Fetches build results for a specific commit from GitLab
 */
export async function getBuildResultsForCommit(
    remoteUrl: URL,
    commitHash: string
): Promise<BuildsResults> {
    const projectId = getProjectIdFromUrl(remoteUrl);

    const url = `${baseUrl}/projects/${projectId}/repository/commits/${commitHash}/statuses`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': getAuthKey(),
        },
    });

    if (!response.ok) {
        throw new Error(
            `Error fetching build results for commit ${commitHash}: ${response.status} ${response.statusText}`
        );
    }

    const data = (await response.json()) as GitlabPipelineStatus[];

    const result = [] as BuildsResults;

    // Map the response to the expected format
    for (const item of data) {
        result.push({
            name: item.name,
            state: mapGitlabPipelineBuildState(item.status),
            url: getPipelineJobUrl(remoteUrl, item.id),
            pipelineUrl: getPipelineUrl(remoteUrl, item.pipeline_id),
        });
    }

    // TODO: this is a temporary solution to get the pipeline URL
    if (data.length > 0) {
        result.pipelineUrl = getPipelineUrl(remoteUrl, data[0]!.pipeline_id);
    }

    return result;
}

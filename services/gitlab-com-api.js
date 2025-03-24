import './user-config.js';

import * as assert from 'assert';

import { fetch } from 'zx';

const gitlabWebUrl = `https://gitlab.com/`;
const baseUrl = `https://gitlab.com/api/v4`;

const getProjectIdFromUrl = (url) => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return encodeURIComponent(parts.join('/'));
};

const getProjectAndRepoFromUrl = (url) => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return parts.slice(0, 2).join('/');
};

const getPipelineJobUrl = (remoteUrl, jobId) => {
    const projectAndRepoParts = getProjectAndRepoFromUrl(remoteUrl);

    return `${gitlabWebUrl}/${projectAndRepoParts}/-/jobs/${jobId}`;
};

const getPipelineUrl = (remoteUrl, pipelineId) => {
    const projectAndRepoParts = getProjectAndRepoFromUrl(remoteUrl);

    return `${gitlabWebUrl}/${projectAndRepoParts}/-/pipelines/${pipelineId}`;
};

const getAuthKey = () => {
    assert.ok(
        process.env.GITLAB_TOKEN,
        'The "GITLAB_TOKEN" value is missing. You need to create the ~/.atl-config file and provide a valid token'
    );

    return process.env.GITLAB_TOKEN;
};

/**
 * @param state
 * @return {BuildState}
 */
const mapGitlabPipelineBuildState = (state) => {
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
 * @param {string} commitHash
 * @param {string} remoteUrl
 * @return {Promise<BuildsResults>}
 */
export async function getBuildResultsForCommit(remoteUrl, commitHash) {
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

    const data = await response.json();

    /** @type {BuildStatus[]} */
    const result = [];

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
        result.pipelineUrl = getPipelineUrl(remoteUrl, data[0].pipeline_id);
    }

    return result;
}

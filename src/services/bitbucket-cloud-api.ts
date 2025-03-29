import * as assert from 'node:assert';
import { fetch } from 'zx';
import type { BuildsResults } from '../builds-providers/types.ts';
import './user-config.ts';

const baseUrl = `https://api.bitbucket.org`;

const getWorkspaceFromUrl = (url: URL): string => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return parts[0]!;
};

const getRepoSlugFromUrl = (url: URL): string => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return parts[1]!;
};

const getAuthKey = (): string => {
    assert.ok(
        process.env.BITBUCKET_CLOUD_USERNAME,
        'The "BITBUCKET_CLOUD_USERNAME" value is missing. You need to create the ~/.atl-config file and provide a valid user name'
    );

    assert.ok(
        process.env.BITBUCKET_CLOUD_TOKEN,
        'The "BITBUCKET_CLOUD_TOKEN" value is missing. You need to create the ~/.atl-config file and provide a valid app token'
    );

    return Buffer.from(
        `${process.env.BITBUCKET_CLOUD_USERNAME}:${process.env.BITBUCKET_CLOUD_TOKEN}`
    ).toString('base64');
};

export async function getBuildResultsForCommit(
    remoteUrl: URL,
    commitHash: string
): Promise<BuildsResults> {
    // /2.0/repositories/{workspace}/{repo_slug}/commit/{commit}/statuses
    // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-commit-statuses/

    const workspace = getWorkspaceFromUrl(remoteUrl);
    const repoSlug = getRepoSlugFromUrl(remoteUrl);

    const url = `${baseUrl}/2.0/repositories/${workspace}/${repoSlug}/commit/${commitHash}/statuses`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${getAuthKey()}`,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Error fetching build results for commit ${commitHash}: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();

    return data.values || [];
}

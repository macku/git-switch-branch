import '../user-config.js';

import * as assert from 'assert';

import { fetch } from 'zx';

const getProjectFromUrl = (url) => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return parts[0];
};

const getRepoSlugFromUrl = (url) => {
    const parts = url.pathname
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .split('/');

    return parts[1];
};

const getBaseUrl = () => {
    assert.ok(
        process.env.BITBUCKET_DC_URL,
        'The "BITBUCKET_DC_URL" value is missing. You need to create the ~/.atl-config file and provide a valid Bitbucket DC URL',
    );

    return process.env.BITBUCKET_DC_URL;
};

const getAuthKey = () => {
    assert.ok(
        process.env.BITBUCKET_DC_TOKEN,
        'The "BITBUCKET_DC_TOKEN" value is missing. You need to create the ~/.atl-config file and provide a valid token',
    );

    return process.env.BITBUCKET_DC_TOKEN;
};

export async function getBuildResultsForCommit(remoteUrl, commitHash) {
    const project = getProjectFromUrl(remoteUrl);
    const repoSlug = getRepoSlugFromUrl(remoteUrl);

    const url = `${getBaseUrl()}/rest/ui/latest/projects/${project}/repos/${repoSlug}/builds?at=${commitHash}&limit=100`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthKey()}`,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Error fetching build results for commit ${commitHash}: ${response.status} ${response.statusText}`,
        );
    }

    const data = await response.json();

    return data?.page?.values ?? [];
}

import '../user-config.js';

import bitbucketPipelinesBuildsProvider from './bitbucket-cloud-pipelines.js';
import bitbucketDcBuildsProvider from './bitbucket-dc-builds.js';

async function isBitbucketDc(remoteUrl) {
    // TODO: Find a better way to check if it's Bitbucket DC
    if (remoteUrl.origin === process.env.BITBUCKET_DC_URL) {
        return true;
    }

    return false;
}

async function isBitbucketCloud(remoteUrl) {
    if (remoteUrl.hostname === 'bitbucket.org') {
        return true;
    }

    return false;
}

export async function getBuildsProvider(remoteUrl) {
    switch (true) {
        case await isBitbucketCloud(remoteUrl):
            return bitbucketPipelinesBuildsProvider;

        case await isBitbucketDc(remoteUrl):
            return bitbucketDcBuildsProvider;

        default:
            throw new Error(
                `Can't resolve a builds provider for ${remoteUrl.toString()} GIT remote`,
            );
    }
}

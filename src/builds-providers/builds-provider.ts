import bitbucketPipelinesBuildsProvider from './bitbucket-cloud-pipelines.ts';
import bitbucketDcBuildsProvider from './bitbucket-dc-builds.ts';
import gitlabComBuildsProvider from './gitlab-com-pipelines.ts';
import type { BuildsProvider } from './types.ts';

import '../services/user-config.ts';

async function isBitbucketDc(remoteUrl: URL): Promise<boolean> {
    // TODO: Find a better way to check if it's Bitbucket DC
    if (remoteUrl.origin === process.env.BITBUCKET_DC_URL) {
        return true;
    }

    return false;
}

async function isBitbucketCloud(remoteUrl: URL): Promise<boolean> {
    if (remoteUrl.hostname === 'bitbucket.org') {
        return true;
    }

    return false;
}

async function isGitlabCom(remoteUrl: URL): Promise<boolean> {
    if (remoteUrl.hostname.startsWith('gitlab.com')) {
        return true;
    }

    return false;
}

export async function getBuildsProvider(
    remoteUrl: URL
): Promise<BuildsProvider> {
    switch (true) {
        case await isBitbucketCloud(remoteUrl):
            return bitbucketPipelinesBuildsProvider;

        case await isBitbucketDc(remoteUrl):
            return bitbucketDcBuildsProvider;

        case await isGitlabCom(remoteUrl):
            return gitlabComBuildsProvider;

        default:
            throw new Error(
                `Can't find or resolve builds provider for ${remoteUrl.toString()} GIT remote`
            );
    }
}

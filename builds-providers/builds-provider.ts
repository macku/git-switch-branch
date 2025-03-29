import '../services/user-config.js';

import bitbucketPipelinesBuildsProvider from './bitbucket-cloud-pipelines.js';
import bitbucketDcBuildsProvider from './bitbucket-dc-builds.js';
import gitlabComBuildsProvider from './gitlab-com-pipelines.js';
import type { BuildsProvider } from './type';

interface RemoteUrl {
    origin: string;
    hostname: string;
    pathname: string;
}

async function isBitbucketDc(remoteUrl: RemoteUrl): Promise<boolean> {
    // TODO: Find a better way to check if it's Bitbucket DC
    if (remoteUrl.origin === process.env.BITBUCKET_DC_URL) {
        return true;
    }

    return false;
}

async function isBitbucketCloud(remoteUrl: RemoteUrl): Promise<boolean> {
    if (remoteUrl.hostname === 'bitbucket.org') {
        return true;
    }

    return false;
}

async function isGitlabCom(remoteUrl: RemoteUrl): Promise<boolean> {
    if (remoteUrl.hostname.startsWith('gitlab.com')) {
        return true;
    }

    return false;
}

export async function getBuildsProvider(
    remoteUrl: RemoteUrl
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

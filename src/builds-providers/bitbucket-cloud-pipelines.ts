import { getBuildResultsForCommit } from '../services/bitbucket-cloud-api.ts';
import type { BuildsProvider } from './types.ts';

const bitbucketCloudBuildsProvider: BuildsProvider =
    async function buildsProvider({ commitHash, remoteUrl }) {
        const buildResults = await getBuildResultsForCommit(
            remoteUrl,
            commitHash
        );

        return buildResults;
    };

export default bitbucketCloudBuildsProvider;

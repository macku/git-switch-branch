import { getBuildResultsForCommit } from '../services/bitbucket-cloud-api.js';
import type { BuildsProvider } from './types';

const bitbucketCloudBuildsProvider: BuildsProvider =
    async function buildsProvider({ commitHash, remoteUrl }) {
        const buildResults = await getBuildResultsForCommit(
            remoteUrl,
            commitHash
        );

        return buildResults;
    };

export default bitbucketCloudBuildsProvider;

import { getBuildResultsForCommit } from '../services/bitbucket-dc-api.js';
import type { BuildsProvider } from './types';

const bitbucketDcBuildsProvider: BuildsProvider =
    async function buildsProvider({ commitHash, remoteUrl }) {
        const buildResults = await getBuildResultsForCommit(
            remoteUrl,
            commitHash
        );

        return buildResults;
    };

export default bitbucketDcBuildsProvider;

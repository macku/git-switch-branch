import { getBuildResultsForCommit } from '../services/bitbucket-dc-api.ts';
import type { BuildsProvider } from './types.ts';

const bitbucketDcBuildsProvider: BuildsProvider =
    async function buildsProvider({ commitHash, remoteUrl }) {
        const buildResults = await getBuildResultsForCommit(
            remoteUrl,
            commitHash
        );

        return buildResults;
    };

export default bitbucketDcBuildsProvider;

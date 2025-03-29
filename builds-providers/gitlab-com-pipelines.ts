import { getBuildResultsForCommit } from '../services/gitlab-com-api.ts';
import type { BuildsProvider } from './types';

const gitlabBuildsProvider: BuildsProvider = async function buildsProvider({
    commitHash,
    remoteUrl,
}) {
    const buildResults = await getBuildResultsForCommit(remoteUrl, commitHash);

    return buildResults;
};

export default gitlabBuildsProvider;

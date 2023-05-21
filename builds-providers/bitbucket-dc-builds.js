import { getBuildResultsForCommit } from '../services/bitbucket-dc-api.js';

export default async function buildsProvider({ commitHash, remoteUrl }) {
    const buildResults = await getBuildResultsForCommit(remoteUrl, commitHash);

    return buildResults;
}

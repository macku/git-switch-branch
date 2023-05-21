import { getBuildResultsForCommit } from '../services/bitbucket-cloud-api.js';

export default async function buildsProvider({ commitHash, remoteUrl }) {
    const buildResults = await getBuildResultsForCommit(remoteUrl, commitHash);

    return buildResults;
}

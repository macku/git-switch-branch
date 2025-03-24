import { getBuildResultsForCommit } from '../services/gitlab-com-api.js';

/**
 * @param {object} options
 * @param {string} options.commitHash
 * @param {string} options.remoteUrl
 * @return {Promise<BuildStatus>}
 */
export default async function buildsProvider({ commitHash, remoteUrl }) {
    const buildResults = await getBuildResultsForCommit(remoteUrl, commitHash);

    return buildResults;
}

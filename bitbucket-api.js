const fetch = require("node-fetch");

const baseUrl = `https://api.bitbucket.org`;

const getWorkspaceFromUrl = (url) => {
  const parts = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");

  return parts[0];
};

const getRepoSlugFromUrl = (url) => {
  const parts = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");

  return parts[1];
};

const getBuildResultsForCommit = async (projectUrl, commitHash) => {
  // /2.0/repositories/{workspace}/{repo_slug}/commit/{commit}/statuses
  // https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Bworkspace%7D/%7Brepo_slug%7D/commit/%7Bcommit%7D/statuses

  const workspace = getWorkspaceFromUrl(projectUrl);
  const repoSlug = getRepoSlugFromUrl(projectUrl);

  const url = `${baseUrl}/2.0/repositories/${workspace}/${repoSlug}/commit/${commitHash}/statuses`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(response.status.toString());
  }

  const data = await response.json();

  return data.values || [];
};

module.exports = {
  getBuildResultsForCommit,
};

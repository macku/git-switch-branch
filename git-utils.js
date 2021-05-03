const util = require("util");
const exec = util.promisify(require("child_process").exec);

const DEFAULT_REMOTE = "origin";

const getCurrentBranch = async () => {
  const { stdout: result } = await exec("git symbolic-ref -q --short HEAD");

  return result.trim();
};

const getBranchRemote = async () => {
  const currentBranch = await getCurrentBranch();
  const remoteForCurrentBranch = await getRemoteForBranch(currentBranch);
  // const defaultGitRemote = await getDefaultRemote();

  const remote = remoteForCurrentBranch || DEFAULT_REMOTE;

  return remote;
};

const getRemoteForBranch = async (branch) => {
  const { stdout: result } = await exec(`git config "branch.${branch}.remote"`);

  return result.trim();
};

// const getDefaultRemote = async () => {
//   const { stdout: result } = await exec(`git config open.default.remote`);
//
//   return result.trim();
// };

const getGitUrl = async (remote) => {
  const { stdout: result } = await exec(`git ls-remote --get-url "${remote}"`);

  return result.trim();
};

const PROTOCOL_REG_EXP = /^([^\:]+):\/\//;
const GIT_SUFFIX_REG_EXP = /\.git$/i;

const normalizeGitUrl = (gitUrl) => {
  let uri;
  let splitResult;

  // Get protocol
  let match = gitUrl.match(PROTOCOL_REG_EXP);
  let protocol = match ? match.pop() : "https";

  // Remove username
  splitResult = gitUrl.split("@");

  if (splitResult.length >= 2) {
    uri = splitResult.slice(1).join("@");
  } else {
    uri = splitResult.join("");
  }

  // Split by domain
  let domain;

  splitResult = uri.split(":");

  domain = splitResult[0];
  uri = splitResult.slice(1).join(":");

  // Remove ".git" suffix
  uri = uri.replace(GIT_SUFFIX_REG_EXP, "");

  return new URL(`${protocol}://${domain}/${uri}`);
};

const getCommitHash = async () => {
  const { stdout: result } = await exec("git rev-parse HEAD");

  return result.trim();
};

module.exports = {
  getBranchRemote,
  getGitUrl,
  normalizeGitUrl,
  getCommitHash,
};

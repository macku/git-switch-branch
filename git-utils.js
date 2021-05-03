const PROTOCOL_REG_EXP = /^([^\:]+):\/\//;
const GIT_SUFFIX_REG_EXP = /\.git$/i;

export function normalizeGitUrl(gitUrl) {
    let uri;
    let splitResult;

    // Get protocol
    let match = gitUrl.match(PROTOCOL_REG_EXP);
    let protocol = match ? match.pop() : 'https';

    // Remove username
    splitResult = gitUrl.split('@');

    if (splitResult.length >= 2) {
        uri = splitResult.slice(1).join('@');
    } else {
        uri = splitResult.join('');
    }

    // Split by domain
    let domain;

    splitResult = uri.split(':');

    domain = splitResult[0];
    uri = splitResult.slice(1).join(':');

    // Remove ".git" suffix
    uri = uri.replace(GIT_SUFFIX_REG_EXP, '');

    return new URL(`${protocol}://${domain}/${uri}`);
}

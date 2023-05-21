const PROTOCOL_REG_EXP = /^([^:]+):\/\//;
const GIT_SUFFIX_REG_EXP = /\.git$/i;

const normalizeValidRemoteUrl = (
    remoteUrl,
    { withPort = false, withOrgProtocol = false } = {}
) => {
    // Get base URL without ports
    const baseUrl = remoteUrl.hostname;

    // Remove ".git" suffix
    const newPath = remoteUrl.pathname.replace(GIT_SUFFIX_REG_EXP, '');

    const port = withPort ? `:${remoteUrl.port}` : '';
    const protocol = withOrgProtocol ? `${remoteUrl.protocol}` : 'https:';

    return new URL(`${protocol}//${baseUrl}${port}${newPath}`);
};

const normalizeCustomRemoteUrl = (
    remoteString,
    { withPorts = false, withOrgProtocol = false } = {}
) => {
    let pathname;
    let splitResult;

    // Get protocol
    let match = remoteString.match(PROTOCOL_REG_EXP);
    let protocol = (withOrgProtocol && match && `${match.pop()}:`) || 'https:';

    // Remove username
    splitResult = remoteString.split('@');

    if (splitResult.length >= 2) {
        pathname = splitResult.slice(1).join('@');
    } else {
        pathname = splitResult.join('');
    }

    // Split by baseUrl
    let baseUrl;

    splitResult = pathname.split(':');

    baseUrl = splitResult[0];
    pathname = splitResult.slice(1).join(':');

    // Remove ".git" suffix
    pathname = pathname.replace(GIT_SUFFIX_REG_EXP, '');

    // Port
    // TODO: Detect ports
    const port = withPorts ? '' : '';

    return new URL(`${protocol}//${baseUrl}${port}/${pathname}`);
};

export function normalizeRemoteUrl(
    remoteUrl,
    { withPort = false, withOrgProtocol = false } = {}
) {
    try {
        const url = new URL(remoteUrl);

        return normalizeValidRemoteUrl(url, { withPort, withOrgProtocol });
    } catch (e) {
        // Fallback to manual resolution of remote URL
        return normalizeCustomRemoteUrl(remoteUrl, {
            withPort,
            withOrgProtocol,
        });
    }
}

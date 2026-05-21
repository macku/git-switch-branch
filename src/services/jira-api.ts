import * as assert from 'node:assert';
import { fetch } from 'zx';
import './user-config.ts';

export interface JiraIssue {
    key: string;
    summary: string;
    status: string;
    priority: string;
    url: string;
}

/**
 * Gets the base URL from the config file
 */
const getBaseUrl = (): string => {
    assert.ok(
        process.env.JIRA_URL,
        'The "JIRA_URL" value is missing. You need to create the ~/.atl-config file and provide a valid Jira URL'
    );

    return process.env.JIRA_URL;
};

/**
 * Gets the auth token from the config file
 */
const getAuthToken = (): string => {
    assert.ok(
        process.env.JIRA_TOKEN,
        'The "JIRA_TOKEN" value is missing. You need to create the ~/.atl-config file and provide a valid Jira API token'
    );

    assert.ok(
        process.env.JIRA_EMAIL,
        'The "JIRA_EMAIL" value is missing. You need to create the ~/.atl-config file and provide your Jira email address'
    );

    return Buffer.from(
        `${process.env.JIRA_EMAIL}:${process.env.JIRA_TOKEN}`
    ).toString('base64');
};

/**
 * Fetches issues assigned to the current user from Jira
 * @param status Optional status to filter issues by
 * @returns List of Jira issues
 */
export async function getJiraIssues(
    status: string | null = null
): Promise<JiraIssue[]> {
    const baseUrl = getBaseUrl();

    // Build JQL query: Get issues assigned to current user, optionally filtered by status
    let jql = 'assignee = currentUser()';

    if (status) {
        jql += ` AND status = "${status}"`;
    }

    jql += ' ORDER BY updated DESC';

    const url = `${baseUrl}/rest/api/2/search?jql=${encodeURIComponent(jql)}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${getAuthToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Error fetching issues from Jira: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();

    return data.issues.map((issue: any) => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority.name,
        url: `${baseUrl}/browse/${issue.key}`,
    }));
}

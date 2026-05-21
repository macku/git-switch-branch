#!/usr/bin/env node --experimental-strip-types

import { chalk } from 'zx';
import { getJiraIssues, JiraIssue } from '../services/jira-api.ts';

// Parse command line arguments
const args = process.argv.slice(2);
const statusArg = args.find((arg) => arg.startsWith('--status='));
const status = statusArg ? statusArg.split('=')[1] : null;

try {
    console.log(
        `🔍 Fetching${status ? ` ${chalk.yellow(status)}` : ''} Jira issues assigned to you...`
    );

    const issues = await getJiraIssues(status);

    if (!issues || issues.length === 0) {
        console.log(
            `\n${chalk.bold('No issues found.')}${status ? ` Try without the status filter or check if '${status}' is a valid status.` : ''}`
        );
        process.exit(0);
    }

    console.log(
        `\n🎯 Found ${chalk.bold(issues.length)} issue${issues.length !== 1 ? 's' : ''}:`
    );

    for (const issue of issues) {
        console.log('\n');
        console.log(`   ${chalk.bold.blue(issue.key)} - ${issue.summary}`);
        console.log(`   ${chalk.green(`Status: ${issue.status}`)}`);
        console.log(`   ${chalk.yellow(`Priority: ${issue.priority}`)}`);
        console.log(`   ${issue.url}`);
    }

    console.log('\n');

    if (status) {
        console.log(
            `Tip: Run ${chalk.cyan('git issues')} without the status filter to see all your issues.`
        );
    } else {
        console.log(
            `Tip: Use ${chalk.cyan('git issues --status=<status>')} to filter issues by status.`
        );
    }

    console.log('');
} catch (err) {
    const error = err as Error;

    console.log(
        `${chalk.bold('Oops. We have an error.')}\n\n${chalk.red(error.stack)}`
    );
    process.exit(1);
}

import { ExitPromptError } from '@inquirer/core';

export const configureInquirer = () => {
    process.on('uncaughtException', (error) => {
        // https://github.com/SBoudrias/Inquirer.js?tab=readme-ov-file#handling-ctrlc-gracefully
        if (
            error instanceof ExitPromptError ||
            (error instanceof Error && error.name === 'ExitPromptError')
        ) {
            // Gracefully exit the process
            process.exitCode = 0;
        } else {
            // Rethrow unknown errors
            throw error;
        }
    });
};

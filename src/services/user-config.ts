import assert from 'node:assert';
import * as path from 'node:path';
import { dotenv } from 'zx';

assert(
    process.env.HOME,
    'User home directory is not defined. Please set the HOME environment variable.'
);

const userHomeDir = process.env.HOME;

const configPath = path.join(userHomeDir, '.atl-config');

dotenv.config(configPath);

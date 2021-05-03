import * as path from 'path';

import * as dotenv from 'dotenv';

const userHomeDir = process.env.HOME;
const configPath = path.join(userHomeDir, '.atl-config');

dotenv.config({ path: configPath });

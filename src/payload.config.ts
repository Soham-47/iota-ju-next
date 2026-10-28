import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Initial Payload CMS Configuration (Phase P01 Baseline)
 * 
 * Sets up PostgreSQL database adapter, Lexical rich text editor,
 * and automatic TypeScript type generation. Ownership transfers to
 * Ritendu for collections, access controls, and migrations after P01.
 */
export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'temp-secret-key-minimum-32-characters-long',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});

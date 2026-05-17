const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_7Sir1zhmUBWl@ep-small-heart-aq7crc5j-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require');
sql.query('DROP TABLE IF EXISTS transactions, category_rules, custom_categories, uploads, users CASCADE;')
  .then(() => console.log('Dropped'))
  .catch(console.error);

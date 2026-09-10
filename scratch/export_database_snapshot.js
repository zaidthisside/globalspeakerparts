const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLES = [
  'categories',
  'products',
  'variants',
  'part_numbers',
  'product_images',
  'downloads',
  'faqs',
  'related_products',
  'orders',
  'payments',
  'payment_settings',
  'newsletter_subscribers',
  'site_settings'
];

function escapeSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    const escapedArr = val.map(item => `"${String(item).replace(/"/g, '\\"')}"`).join(',');
    return `'{${escapedArr}}'`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateSqlInserts(tableName, rows) {
  if (!rows || rows.length === 0) return `-- No records in ${tableName}\n\n`;

  const columns = Object.keys(rows[0]);
  let sql = `-- Table: ${tableName} (${rows.length} rows)\n`;
  
  for (const row of rows) {
    const cols = columns.map(c => `"${c}"`).join(', ');
    const values = columns.map(c => escapeSqlValue(row[c])).join(', ');
    sql += `INSERT INTO "${tableName}" (${cols}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
  }
  sql += '\n';
  return sql;
}

async function exportDatabase() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const backupDirName = `db_backup_${timestamp}`;
  const backupsBasePath = path.join(__dirname, '..', 'backups');
  const targetDir = path.join(backupsBasePath, backupDirName);

  if (!fs.existsSync(backupsBasePath)) {
    fs.mkdirSync(backupsBasePath, { recursive: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`Starting live database backup from ${supabaseUrl}...`);
  console.log(`Target directory: ${targetDir}`);

  const snapshot = {
    exportedAt: now.toISOString(),
    supabaseUrl: supabaseUrl,
    summary: {},
    data: {}
  };

  let fullRestoreSql = `-- ==========================================================\n`;
  fullRestoreSql += `-- Global Speaker Parts - Database Backup Restore Script\n`;
  fullRestoreSql += `-- Exported At: ${now.toISOString()}\n`;
  fullRestoreSql += `-- Source URL: ${supabaseUrl}\n`;
  fullRestoreSql += `-- ==========================================================\n\n`;

  for (const table of TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.warn(`[WARN] Table '${table}' could not be exported:`, error.message);
        snapshot.summary[table] = { status: 'error', error: error.message, count: 0 };
        continue;
      }

      const rows = data || [];
      console.log(`✓ Exported table '${table}': ${rows.length} records`);

      snapshot.summary[table] = { status: 'success', count: rows.length };
      snapshot.data[table] = rows;

      // Save individual table JSON
      const tableFilePath = path.join(targetDir, `${table}.json`);
      fs.writeFileSync(tableFilePath, JSON.stringify(rows, null, 2), 'utf8');

      // Add to restore SQL
      fullRestoreSql += generateSqlInserts(table, rows);

    } catch (err) {
      console.error(`[ERROR] Failed exporting table '${table}':`, err.message);
      snapshot.summary[table] = { status: 'error', error: err.message, count: 0 };
    }
  }

  // Save complete aggregate JSON snapshot
  const fullSnapshotPath = path.join(targetDir, 'full_database_snapshot.json');
  fs.writeFileSync(fullSnapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');

  // Save restore SQL file
  const restoreSqlPath = path.join(targetDir, 'restore_data.sql');
  fs.writeFileSync(restoreSqlPath, fullRestoreSql, 'utf8');

  // Save a README with instructions
  const readmeContent = `# Database Backup: ${timestamp}

## Backup Summary
- **Export Date:** ${now.toUTCString()}
- **Database Endpoint:** \`${supabaseUrl}\`
- **Tables Exported:**
${Object.entries(snapshot.summary).map(([tbl, s]) => `  - **${tbl}**: ${s.count} rows (${s.status})`).join('\n')}

## Files in this Backup:
1. \`full_database_snapshot.json\`: Consolidated JSON containing all tables and metadata.
2. \`restore_data.sql\`: Direct SQL script with \`INSERT ... ON CONFLICT DO NOTHING\` queries to restore this backup in Supabase SQL Editor.
3. \`*.json\`: Individual table JSON data files for easy inspection or import.
`;

  fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent, 'utf8');

  console.log(`\n==========================================================`);
  console.log(`✓ Backup successfully completed!`);
  console.log(`Location: ${targetDir}`);
  console.log(`==========================================================\n`);

  return targetDir;
}

exportDatabase().catch(err => {
  console.error("Backup process failed:", err);
  process.exit(1);
});

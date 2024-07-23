const pg = await import('pg');
const Pool = pg.default.Pool;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'project'
})

export default pool;
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://namaUser:0c4b521a250fd0f5788e50d884be8732ed4aa41778ae443775c527827e1b62f7@localhost:5432/mydb'
  // host: 'localhost',
  // port: 5432,
  // database: 'mydb',
  // user: 'namaUser',
  // password: 'password',
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Koneksi berhasil!');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users3 (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabel users berhasil dibuat!');

    await client.query(`
      INSERT INTO users3 (name, email) VALUES
      ('Budi', 'budi@email.com'),
      ('Sari', 'sari@email.com')
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('✅ Data berhasil diinsert!');

    // Ambil data
    const result = await client.query('SELECT * FROM users3');
    console.log('📋 Isi tabel users:');
    console.table(result.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('🔌 Koneksi ditutup.');
  }
}

main();

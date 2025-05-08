// scripts/clearMessages.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat-ai';
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to', uri);

  const db = client.db();
  const result = await db.collection('messages').deleteMany({});
  console.log(`Deleted ${result.deletedCount} messages`);

  await client.close();
  console.log('Done');
}

main().catch(err => {
  console.error('Error clearing messages:', err);
  process.exit(1);
});

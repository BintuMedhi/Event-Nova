const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars from the root backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventnova';

const viewUsers = async () => {
  console.log('\n====================================================');
  console.log('🔍 EVENTNOVA USER REGISTRATION VIEWER');
  console.log('====================================================');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log('✅ Connected successfully!\n');
    console.log('Fetching registered users...\n');

    const users = await User.find().sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('📭 No users have registered yet.');
    } else {
      console.log(`Found ${users.length} registered user(s):\n`);
      
      // Print header
      console.log('---------------------------------------------------------------------------------------------------------');
      console.log(`| ${'Name'.padEnd(20)} | ${'Email'.padEnd(30)} | ${'Role'.padEnd(12)} | ${'Referral Code'.padEnd(15)} | ${'Registered'.padEnd(12)} |`);
      console.log('---------------------------------------------------------------------------------------------------------');

      // Print rows
      users.forEach(user => {
        const name = (user.name || 'Unknown').substring(0, 20).padEnd(20);
        const email = (user.email || 'N/A').substring(0, 30).padEnd(30);
        const role = (user.role || 'user').padEnd(12);
        const refCode = (user.referralCode || 'None').substring(0, 15).padEnd(15);
        
        // Format date simply as YYYY-MM-DD
        const dateStr = user.createdAt ? user.createdAt.toISOString().split('T')[0].padEnd(12) : 'Unknown     ';

        console.log(`| ${name} | ${email} | ${role} | ${refCode} | ${dateStr} |`);
      });
      console.log('---------------------------------------------------------------------------------------------------------');
    }

    console.log('\n✅ Disconnecting from database...');
    await mongoose.disconnect();
    console.log('Goodbye! 👋\n');

  } catch (error) {
    console.log('\n❌ CONNECTION FAILED');
    console.log('----------------------------------------------------');
    console.log(error.message);
    console.log('\nMake sure your MongoDB is running, or your Atlas URL is correct in the .env file!');
    process.exit(1);
  }
};

viewUsers();

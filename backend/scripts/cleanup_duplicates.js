const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../src/models/Event'); // Adjust path as needed

dotenv.config({ path: '../.env' }); // Adjust relative path to .env

async function cleanupDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventnova');
    console.log('Connected to MongoDB.');

    // Find all events
    const allEvents = await Event.find({});
    console.log(`Found ${allEvents.length} total events.`);

    const titleMap = {};

    for (const event of allEvents) {
      const title = event.title;
      if (!titleMap[title]) {
        titleMap[title] = [];
      }
      titleMap[title].push(event);
    }

    let deletedCount = 0;

    for (const [title, events] of Object.entries(titleMap)) {
      if (events.length > 1) {
        // Sort events so the one with the shortest slug is kept (the original one)
        events.sort((a, b) => {
          if (a.slug && b.slug) return a.slug.length - b.slug.length;
          return 0;
        });

        const eventToKeep = events[0];
        const eventsToDelete = events.slice(1);

        for (const eventToDelete of eventsToDelete) {
          await Event.findByIdAndDelete(eventToDelete._id);
          deletedCount++;
        }
        console.log(`Kept "${eventToKeep.title}" (slug: ${eventToKeep.slug}), deleted ${eventsToDelete.length} duplicates.`);
      }
    }

    console.log(`\nCleanup complete! Deleted ${deletedCount} duplicate events.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDuplicates();

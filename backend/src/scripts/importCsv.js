const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Event = require('../models/Event');
const User = require('../models/User');

const CSV_FILE_PATH = path.join(__dirname, '../../../EventNova_Events_Dataset_2026 - EventNova Dataset.csv');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventnova';

const ASSETS_DIR = path.join(__dirname, '../../../frontend/public/assets/events');
const WORKSPACE_ROOT = path.join(__dirname, '../../../');

const BANNERS = {
  'Music Concert': 'https://images.unsplash.com/photo-1540039155732-61ee020c66db?auto=format&fit=crop&q=80&w=800',
  'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
  'Business': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
  'Expo': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  'Workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
  'Festival': 'https://images.unsplash.com/photo-1533174000244-b04313f86e35?auto=format&fit=crop&q=80&w=800',
  'Default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
};

const CATEGORY_MAP = {
  'Music Concert': 'Music',
  'Hackathon': 'Tech Conference',
  'Business': 'Startup Meet',
  'Expo': 'Tech Conference',
  'Workshop': 'Workshop',
  'Festival': 'College Fest'
};

async function importCSV() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
    console.log('✅ Connected to MongoDB');

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@eventnova.com',
        password: 'password123',
        role: 'admin'
      });
    }

    // Ensure assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    const events = [];
    let detectedBanners = 0;
    let linkedBanners = 0;
    let bannerErrors = 0;

    console.log('\n--- Banner Mapping Report ---');

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        if (!row['Event Name']) return;
        
        let dbCategory = CATEGORY_MAP[row['Category']] || 'Music';
        const eventDateStr = row['Start Date'];
        let eventDate = new Date();
        
        const parts = eventDateStr ? eventDateStr.split('-') : [];
        if (parts.length === 3) {
            if (parseInt(parts[1]) > 12) {
                eventDate = new Date(`${parts[0]}-${parts[2]}-${parts[1]}`);
            } else {
                eventDate = new Date(eventDateStr);
            }
        }
        if (isNaN(eventDate.getTime())) eventDate = new Date();

        const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
        const price = parseInt(row['Price (INR)'], 10) || 0;

        // --- Banner Logic ---
        let bannerUrl = '';
        let providedBanner = row['Banner'] ? row['Banner'].trim() : '';

        if (providedBanner) {
          detectedBanners++;
          if (providedBanner.startsWith('http://') || providedBanner.startsWith('https://')) {
            bannerUrl = providedBanner;
            linkedBanners++;
            console.log(`[URL] ${row['Event Name']} -> ${providedBanner}`);
          } else {
            // Local file handling
            const cleanProvided = providedBanner.replace(/^\/+/, '');
            const sourcePath = path.resolve(WORKSPACE_ROOT, cleanProvided);
            // Check if file exists in public/assets/events already
            const isAlreadyInPublic = providedBanner.startsWith('/assets/events/');
            
            if (isAlreadyInPublic) {
                bannerUrl = providedBanner;
                linkedBanners++;
                console.log(`[FILE] ${row['Event Name']} -> Already in public: ${bannerUrl}`);
            } else if (fs.existsSync(sourcePath)) {
              const filename = path.basename(sourcePath);
              const destPath = path.join(ASSETS_DIR, filename);
              
              // Copy file
              fs.copyFileSync(sourcePath, destPath);
              bannerUrl = `/assets/events/${filename}`;
              linkedBanners++;
              console.log(`[FILE] ${row['Event Name']} -> Found local: ${providedBanner} -> Linked: ${bannerUrl}`);
            } else {
              bannerErrors++;
              bannerUrl = BANNERS[row['Category']] || BANNERS['Default'];
              console.log(`[ERROR] ${row['Event Name']} -> Local file not found: ${sourcePath} -> Fallback used.`);
            }
          }
        } else {
          bannerUrl = BANNERS[row['Category']] || BANNERS['Default'];
          console.log(`[NONE] ${row['Event Name']} -> No banner in CSV -> Fallback used.`);
        }

        const cleanSlug = row['Event Name']
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        const randomChars = Math.random().toString(36).substring(2, 6);
        const slug = `${cleanSlug}-${randomChars}`;

        events.push({
          title: row['Event Name'],
          slug: slug,
          description: row['Description'] || `Join us for ${row['Event Name']} in ${row['City']}.`,
          category: dbCategory,
          banner: bannerUrl,
          date: eventDate,
          endDate: endDate,
          venue: {
            name: row['Venue'] || 'Main Arena',
            address: `${row['Venue'] || 'Arena'}, ${row['City']}, ${row['State']}`,
            city: row['City'] || 'Unknown'
          },
          ticketTiers: [{
            name: 'General Admission',
            price: price,
            totalSeats: 500,
            soldSeats: 0
          }],
          tags: [row['Category'] || 'Event', row['City'] || 'Local'],
          organizerId: adminUser._id,
          status: 'published',
          popularityScore: Math.floor(Math.random() * 40) + 60,
          featured: row['Category'] === 'Music Concert'
        });
      })
      .on('end', async () => {
        console.log('-----------------------------\n');
        
        let imported = 0;
        for (const eventData of events) {
          try {
            await Event.findOneAndUpdate(
              { title: eventData.title },
              { $set: eventData },
              { upsert: true, new: true, runValidators: true }
            );
            imported++;
          } catch (e) {
            console.error(`Error importing ${eventData.title}:`, e.message);
          }
        }

        console.log(`\n=== IMPORT SUMMARY ===`);
        console.log(`Events Processed: ${events.length}`);
        console.log(`Events Successfully Imported/Updated: ${imported}`);
        console.log(`Banners Detected in CSV: ${detectedBanners}`);
        console.log(`Banners Successfully Linked: ${linkedBanners}`);
        console.log(`Banner Errors (Missing local files): ${bannerErrors}`);
        console.log(`======================\n`);
        
        process.exit(0);
      });

  } catch (err) {
    console.error('❌ Error importing CSV:', err.message);
    process.exit(1);
  }
}

importCSV();

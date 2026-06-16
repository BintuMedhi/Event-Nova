const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify/sync');

const CSV_FILE_PATH = path.join(__dirname, '../../../EventNova_Events_Dataset_2026 - EventNova Dataset.csv');

const BANNERS = {
  'Arijit Singh Live 2026': 'https://i.pinimg.com/736x/8f/58/a5/8f58a5c36af8c0825ebbf7f3a8b23ff0.jpg',
  'Shreya Ghoshal Melody Night': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  'A.R. Rahman World Tour India': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800',
  'Sonu Nigam Unplugged': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
  'Armaan Malik Live in Concert': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800',
  'Nilesh Rage ': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800',
  'Winter Carnival 2026': 'https://images.unsplash.com/photo-1533174000244-b04313f86e35?auto=format&fit=crop&q=80&w=800',
  'Taylor swift ': 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=800',
  'Guns N\' Roses': 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&q=80&w=800'
};

async function fillBanners() {
  const records = [];
  
  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (row) => {
      if (row['Event Name'] && BANNERS[row['Event Name']]) {
        row['Banner'] = BANNERS[row['Event Name']];
      }
      records.push(row);
    })
    .on('end', () => {
      // Need to stringify
      const csvString = stringify(records, { header: true });
      fs.writeFileSync(CSV_FILE_PATH, csvString);
      console.log('Successfully filled CSV with banners');
    });
}

fillBanners();

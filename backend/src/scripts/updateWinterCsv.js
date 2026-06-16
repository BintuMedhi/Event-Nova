const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify/sync');

const CSV_FILE_PATH = 'D:/Event Nova/EventNova_Events_Dataset_2026 - EventNova Dataset.csv';

const records = [];
fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on('data', (row) => {
    // Check for "Winter Carnival" partial match since there's a trailing space or exactly "Winter Carnival 2026"
    if (row['Event Name'] && row['Event Name'].includes('Winter Carnival')) {
      row['Banner'] = '/assets/events/winter-carnival-official.jpg';
    }
    records.push(row);
  })
  .on('end', () => {
    const csvString = stringify(records, { header: true });
    fs.writeFileSync(CSV_FILE_PATH, csvString);
    console.log('Successfully updated CSV for Winter Carnival banner');
  });

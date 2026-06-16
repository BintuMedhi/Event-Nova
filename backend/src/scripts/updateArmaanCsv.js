const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify/sync');

const CSV_FILE_PATH = 'D:/Event Nova/EventNova_Events_Dataset_2026 - EventNova Dataset.csv';

const records = [];
fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on('data', (row) => {
    if (row['Event Name'] && row['Event Name'].toLowerCase().includes('armaan malik')) {
      row['Banner'] = '/assets/events/armaan-malik-official.jpg';
    }
    records.push(row);
  })
  .on('end', () => {
    const csvString = stringify(records, { header: true });
    fs.writeFileSync(CSV_FILE_PATH, csvString);
    console.log('Successfully updated CSV for Armaan Malik banner');
  });

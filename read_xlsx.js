const xlsx = require('xlsx');
try {
  const workbook = xlsx.readFile('PANCHAYATLIST.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  // Extract non-empty strings from the first column or all columns
  let list = [];
  data.forEach(row => {
    row.forEach(cell => {
      if (cell && typeof cell === 'string') {
        list.push(cell.trim());
      }
    });
  });
  
  console.log(JSON.stringify(list.filter(Boolean), null, 2));
} catch (e) {
  console.error("Error reading file:", e.message);
}

import Papa from 'papaparse';

export async function getProducts() {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmWGw45EhjlY-hZg1mmLuFKJutWCgk74f3HdsBQ_lW9YGIFrPRjHfeH3lMqJiJ-spK2Ulz7ai8FzvR/pub?output=csv';
  const response = await fetch(csvUrl);
  const csvData = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // 将 features 字符串转换成数组
        const products = results.data.map(p => ({
          ...p,
          features: p.features ? p.features.split(',') : [],
          platforms: { shein: p.shein }
        }));
        resolve(products);
      }
    });
  });
}
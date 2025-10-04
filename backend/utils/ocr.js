const Tesseract = require('tesseract.js');

const extractReceiptData = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m)
    });

    // Extract data using regex patterns
    const extractedData = {
      amount: null,
      date: null,
      description: '',
      merchantName: ''
    };

    // Extract amount (looks for patterns like $123.45, 123.45, etc.)
    const amountRegex = /(?:\$|USD|Rs\.?|€|£)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/g;
    const amounts = [];
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 1000000) {
        amounts.push(amount);
      }
    }
    extractedData.amount = amounts.length > 0 ? Math.max(...amounts) : null;

    // Extract date (various formats)
    const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      extractedData.date = dateMatch[1];
    }

    // Extract merchant name (usually at the top, first few lines)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      extractedData.merchantName = lines[0].trim();
      extractedData.description = `Purchase from ${lines[0].trim()}`;
    }

    return extractedData;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process receipt image');
  }
};

module.exports = { extractReceiptData };
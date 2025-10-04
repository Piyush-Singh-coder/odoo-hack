const axios = require('axios');

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rate = response.data.rates[toCurrency];
    
    if (!rate) {
      throw new Error('Currency conversion rate not found');
    }

    return (amount * rate).toFixed(2);
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    throw new Error('Failed to convert currency');
  }
};

const getCountryCurrency = async (countryName) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    const country = response.data.find(c => 
      c.name.common.toLowerCase() === countryName.toLowerCase() ||
      c.name.official.toLowerCase() === countryName.toLowerCase()
    );

    if (!country || !country.currencies) {
      return 'USD'; // Default currency
    }

    const currencyCode = Object.keys(country.currencies)[0];
    return currencyCode;
  } catch (error) {
    console.error('Error fetching country currency:', error.message);
    return 'USD'; // Default currency
  }
};

module.exports = { convertCurrency, getCountryCurrency };
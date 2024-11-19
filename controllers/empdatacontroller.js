const fs = require('fs');
const path = require('path');

// Load the static JSON data and cache it in memory
let cachedData = null;
let cacheTimestamp = null;
const CACHE_EXPIRATION_TIME = 6000000; // 1 hr
const dataFilePath = path.join(__dirname, '../data/empdata.json');

const loadData = () => {
    const now = Date.now();
  
    if (cachedData && (now - cacheTimestamp) < CACHE_EXPIRATION_TIME) {
      return cachedData;
    }
  
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    cachedData = JSON.parse(rawData);
    cacheTimestamp = now;
    return cachedData;
};

// Utility function to filter data
const filterData = (data, filters) => {

  return data.filter(item => {
    return filters.every(filter => {
      filter.field=filter.field.toUpperCase();  
      const { field, operator, value } = filter;  
      switch (operator) {
        case 'eq': // Equal
          return item[field] == value;
        case 'neq': // Not Equal
          return item[field] != value;
        case 'in': // In
          return Array.isArray(value) && value.includes(item[field]);
        case 'nin': // Not In
          return Array.isArray(value) && !value.includes(item[field]);
        case 'gt': // Greater Than
          return item[field] > value;
        case 'lt': // Less Than
          return item[field] < value;
        case 'or': // OR (any condition can be true)
          return value.some(val => item[field] == val);
        case 'like': // LIKE (substring match using regex)
        console.log(typeof item[field]);
        //   if (typeof item[field] === 'string') {
            const regex = new RegExp(value, 'i'); // 'i' for case-insensitive
            return regex.test(item[field]);
        //   }
          return false;  
        default:
          return false;
      }
    });
  });
};

// Controller function to get filtered data
const getFilteredData = (req, res) => {
  const data = loadData();
  //console.log(req.query);
  const { filters } = req.query;  // Example: filters=age:eq:30&city:in:Los Angeles,New York
  //console.log(filters+"====filters");
  const filterConditions = parseFilters(filters);
//console.log(filterConditions);
  try {
    const filteredData = filterData(data, filterConditions);
    if(filteredData)
    res.json(filteredData);
    else
    res.json('No Data Found!...');
  } catch (error) {
    res.status(400).json({ error: 'Invalid filter format' });
  }
};

// Parse filters from query parameters
const parseFilters = (filters) => {
    console.log(filters);
  if (!filters) return [];

  return filters.split('!!').map(filter => {
    const [field, operator, value] = filter.split(':');
    return {
      field,
      operator,
      value: operator === 'in' || operator === 'nin' ? value.split(',') : value
    };
  });
};

module.exports = { getFilteredData };
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
let numbersWindow = [];

const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i < num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isFibonacci = (num) => {
  const isPerfectSquare = (x) => {
    let s = parseInt(Math.sqrt(x));
    return (s * s === x);
  };
  return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
};

const isEven = (num) => num % 2 === 0;

const fetchNumbers = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
      timeout: 500
    });
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching data from third-party server:', error.message);
    return [];
  }
};

const getRandomNumber = async () => {
  const url = 'http://20.244.56.144/test/rand'; 
  return fetchNumbers(url);
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  let numbers = [];
  let url = '';

  switch (numberid) {
    case 'p':
      url = 'http://20.244.56.144/test/primes'; 
      break;
    case 'f':
      url = 'http://20.244.56.144/test/fibo'; 
      break;
    case 'e':
      url = 'http://20.244.56.144/test/even'; 
      break;
    case 'r':
      numbers = await getRandomNumber();
      break;
    default:
      return res.status(400).send('Invalid number ID');
  }

  if (!numbers.length && url) {
    numbers = await fetchNumbers(url);
  }

  numbers = [...new Set(numbers)];

  numbersWindow = [...numbersWindow, ...numbers];
  if (numbersWindow.length > WINDOW_SIZE) {
    numbersWindow = numbersWindow.slice(-WINDOW_SIZE);
  }

  const average = numbersWindow.reduce((acc, val) => acc + val, 0) / numbersWindow.length;

  res.json({
    windowPrevState: numbersWindow.slice(0, numbersWindow.length - numbers.length),
    windowCurrState: numbersWindow,
    numbers,
    avg: parseFloat(average.toFixed(2)),
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

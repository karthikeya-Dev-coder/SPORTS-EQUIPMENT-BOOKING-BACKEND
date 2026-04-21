import axios from 'axios';

async function test() {
  try {
    const response = await axios.get('https://equipment-booking-backend.vercel.app/api/equipment');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();

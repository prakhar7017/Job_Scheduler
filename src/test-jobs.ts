import axios from 'axios';

/**
 * Simple test script to create different types of jobs
 */
async function createTestJobs() {
  const API_URL = 'http://localhost:3000/scheduler/jobs';
  
  try {
    // Create an hourly job that runs at the 30th minute of every hour
    const hourlyJob = await axios.post(API_URL, {
      name: 'Hourly Test Job',
      type: 'hourly',
      config: {
        minute: 30
      }
    });
    console.log('Hourly job created:', hourlyJob.data);
    
    // Create a daily job that runs at 9:00 AM every day
    const dailyJob = await axios.post(API_URL, {
      name: 'Daily Test Job',
      type: 'daily',
      config: {
        hour: 9,
        minute: 0
      }
    });
    console.log('Daily job created:', dailyJob.data);
    
    // Create a weekly job that runs at 10:30 AM every Monday
    const weeklyJob = await axios.post(API_URL, {
      name: 'Weekly Test Job',
      type: 'weekly',
      config: {
        dayOfWeek: 1, // Monday
        hour: 10,
        minute: 30
      }
    });
    console.log('Weekly job created:', weeklyJob.data);
    
    // Get all jobs
    const allJobs = await axios.get(API_URL);
    console.log('All scheduled jobs:', allJobs.data);
    
  } catch (error) {
    console.error('Error creating test jobs:', error.response?.data || error.message);
  }
}

// Run the test
createTestJobs();

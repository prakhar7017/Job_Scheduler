import axios from 'axios';

/**
 * Creates a job that will run immediately (or very soon) for testing purposes
 */
async function createImmediateJob() {
  const API_URL = 'http://localhost:3000/scheduler/jobs';
  
  // Get current date and time
  const now = new Date();
  const currentMinute = now.getMinutes();
  const currentHour = now.getHours();
  
  // Set the job to run at the next minute
  const nextMinute = (currentMinute + 1) % 60;
  
  try {
    // Create a job that will run at the next minute
    const immediateJob = await axios.post(API_URL, {
      name: 'Immediate Test Job',
      type: 'hourly',
      config: {
        minute: nextMinute
      }
    });
    
    console.log(`Job created to run at minute ${nextMinute} of every hour:`);
    console.log(immediateJob.data);
    console.log(`Current time: ${now.toLocaleTimeString()}`);
    console.log(`Job will run in less than 1 minute. Watch the console for "Hello World" output.`);
    
  } catch (error) {
    console.error('Error creating immediate job:', error.response?.data || error.message);
  }
}

// Run the test
createImmediateJob();

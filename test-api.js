// Quick test of Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBsPmn3AZNoZpS8CUK0NUHvhquUxaZCM4I';

async function testAPI() {
  console.log('Testing Gemini API...');
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('✅ GoogleGenerativeAI initialized');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Model created');
    
    const result = await model.generateContent('Write one sentence about coding.');
    console.log('✅ API call successful');
    
    const text = result.response.text();
    console.log('✅ Generated text:', text);

    // List models
    // const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    // const response = await fetch(listUrl);
    // const data = await response.json();
    // console.log('Available models:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testAPI();

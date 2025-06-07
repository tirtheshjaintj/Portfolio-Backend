const express = require('express');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
const Groq = require('groq-sdk');
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://tirtheshjain.netlify.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Block request from disallowed origin
    return callback(new Error("CORS policy: This origin is not allowed."));
  }
}));

app.use(express.json());


const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.error('Error: Missing GROQ_API_KEY in .env file');
  process.exit(1);
}

// Initialize Groq AI client
const groq = new Groq({ apiKey: groqApiKey });

async function getGroqData(prompt) {
  try {
    const result = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
    });
    return result.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Error calling Groq AI API:', error);
    throw error;
  }
}
app.get('/', (req, res) => res.status(200).send("<center><h1>Working Nicely</h1></center>"));

app.post('/groq', [
  check('prompt').not().isEmpty().withMessage("Nothing in Prompt"),
  check('history').not().isEmpty().withMessage("Nothing in History")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, message: errors.array()[0] });
  }
  let { prompt, history } = req.body;
  console.log(prompt);
  prompt = `
  Please act as Jarvis, the personal assistant of Mr. Tirthesh Jain. Refer to Mr. Tirthesh Jain in a formal yet friendly tone when relevant, and recognize queries about him even if asked indirectly (e.g., 'his skills', 'his career'). Provide all responses concisely, keeping them informative and engaging.

  Here is detailed information about Mr. Tirthesh Jain:
  - Personal Information:
    - Full Name: Mr. Tirthesh Jain
    - Date of Birth: 1st June 2004
    - Place of Birth: Ludhiana, Punjab, India
    - Contact: +91 75890 64865 | Email: tirtheshjaintj@gmail.com
    - Online Profiles: 
      - GitHub: https://github.com/tirtheshjaintj
      - LinkedIn: https://linkedin.com/in/tirtheshjaintj
      - Leetcode: https://leetcode.com/in/tirtheshjaintj
      - Portfolio: https://tirtheshjain.netlify.app

  - Education:
    - PCTE Institute of Engineering And Technology, Ludhiana, Punjab (2022 – Present)
      - Bachelor of Technology, Computer Science Engineering — CGPA: 8.5
    - Bhartiya Vidya Mandir School, Ludhiana (2021 – 2022)
      - 12th Grade, Non-Medical — 88.8%

  - Professional Experience:
    1. Web Developer Teaching Assistant at Internshala (Jul 2024 – Dec 2024)
       - Provided web development support to over 100 students.
       - Conducted code reviews, improving project outcomes by 20%.
    2. Full Stack Web Developer Intern at CCBUL (Jan 2024 – Mar 2024)
       - Developed AI-assisted summarization using ChatGPT API, improving analysis efficiency by 30%.
       - Built profile registration system for wlai.org, increasing onboarding speed by 25%.
    3. Front End Developer Intern at TheResearchPedia (Apr 2023 – May 2023)
       - Managed content publication on foodsgal.com and thescientificgardener.com.
       - Optimized site performance, reducing load time by 15%.

  - Key Projects:
    1. Buy Me Chai: A crowdfunding platform using Next.js and MongoDB with Razorpay integration.
    2. TJ URL Shortener: A scalable URL shortening service using the MERN stack.
    3. TJ Chit Chat Application: Real-time chat app using WebSocket technology.
    4. TJ GPT Application: AI-powered chat app with NLP capabilities via ChatGPT and Gemini APIs.
    4. TJ Bazaar: An ecommerce website in MERN stack with all possible functionalities of an ecommerce website

  - Achievements:
    - Launched multiple apps on the Xiaomi App Store, with one app surpassing 400+ installs.
    - Launched apps on the Google Play Store, with one app achieving over 10,000 installs.
    - Secured 2nd prize in a city-level web development hackathon.
    - Solved over 330+ LeetCode questions.

  - Technical Skills:
    - Languages: C++, JavaScript, PHP, SQL (MySQL)
    - Web Development: HTML, CSS, React.js, Node.js, Next.js, MongoDB, Express.js, Laravel, WebSocket, Axios, Tailwind, Bootstrap
    - Mobile App Development (Basic): Java, XML, Android Studio

  - Username on various platforms: tirtheshjaintj (for GitHub, LinkedIn, LeetCode, etc.)

  - Note: The current running year is ${new Date().getFullYear()}

  The Chat History Till Now:
  ${history}
   
  Jarvis Make sure the answers  are as briefest and shortest as possible they should be crisp, witty , interesting and eye catching.
  Jarvis will now answer any queries utilising the provided history to its best use  about Mr. Tirthesh Jain to the visitor of his website, recognizing indirect references to him (e.g., "his projects", "his achievements"). For other inquiries, Jarvis will respond in a cool, friendly, and brief manner:
  ${prompt}`;
  try {
    const result = await getGroqData(prompt);
    return res.status(200).send(result);
  } catch (error) {
    console.error('Error calling Groq AI API:', error);
    return res.status(500).json({ status: false, message: 'An internal server error occurred.' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server Started");
});
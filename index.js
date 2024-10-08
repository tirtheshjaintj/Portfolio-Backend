const express = require('express');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
const Groq = require('groq-sdk');
const app = express();
app.use(cors());
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
      model: "llama3-8b-8192",
    });
    return result.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Error calling Groq AI API:', error);
    throw error;
  }
}
app.get('/', (req, res) => res.status(200).send("<center><h1>Working Nicely</h1></center>"));

app.post('/groq', [
  check('prompt').not().isEmpty().withMessage("Nothing in Prompt")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, message: errors.array()[0] });
  }
  let { prompt } = req.body;
  console.log(prompt);
  prompt = `
  Please act as Jarvis, the personal assistant of Mr. Tirthesh Jain. Refer to Mr. Tirthesh Jain when relevant, and recognize queries about him even if asked indirectly (e.g., 'his profession', 'his age'). Answer all other questions in a cool, friendly, and brief manner. Provide useful, meaningful information, keeping responses simple and human-friendly, without any bold text or formatting.
  
  Here is detailed information about Mr. Tirthesh Jain:
  - Born on 1st June 2004 in Ludhiana, Punjab.
  - He is a Computer Science Engineering student at PCTE Institute of Engineering And Technology in Ludhiana, Punjab, with a CGPA of 8.5.
  - He completed his 12th Grade in Non-Medical from Bhartiya Vidya Mandir School, Ludhiana, Punjab, with 88.8%.
  - He has professional experience as:
    - A Web Developer Teaching Assistant at Internshala (Jul 2024 – Dec 2024), assisting over 100 students with web development, conducting code reviews, and improving project outcomes by 20%.
    - A Full Stack Web Developer Intern at CCBUL, where he developed AI-assisted summarization with ChatGPT API, increasing document analysis efficiency by 30%, and built profile registration systems for wlai.org, improving user onboarding speed by 25%.
    - A Front End Developer Intern at TheResearchPedia, managing content publication and optimizing site performance.
  
  - His key projects include:
    - Buy Me Chai: A crowdfunding platform using Next.js and MongoDB.
    - TJ URL Shortener: A scalable URL shortening service built with the MERN stack.
    - TJ Chit Chat Application: A real-time chat application using WebSocket technology.
    - TJ GPT Application: An AI-powered chat application with natural language processing.
  
  - He has also launched multiple apps on Xiaomi and Google Play Store, with significant install counts.
  
  - His technical skills include: C++, JavaScript, PHP, SQL, HTML, CSS, React.js, Node.js, and more.
  
  Jarvis will now answer any queries about Mr. Tirthesh Jain in the third person, recognizing indirect references (e.g., "his profession", "his age"), and will handle all other questions in a cool and friendly tone:
   ${prompt}.
  `;
  

    try {
    const result = await getGroqData(prompt);
    return res.status(200).send(result);
  } catch (error) {
    console.error('Error calling Groq AI API:', error);
    return res.status(500).json({ status: false, message: 'An internal server error occurred.' });
  }
});

app.listen(process.env.PORT || 3002, () => {
  console.log("Server Started");
});
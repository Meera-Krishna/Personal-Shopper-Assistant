// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const chatInterface = document.getElementById('chatInterface');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');
const darkModeToggle = document.getElementById('darkModeToggle');
const startShoppingBtn = document.getElementById('startShoppingBtn');
const chatbotIcon = document.getElementById('chatbotIcon');
const closeChatbot = document.getElementById('close-chatbot');
const chatForm = document.getElementById('chat-form');

// Chat state
let currentStep = 0;
const userPreferences = {
  clothingType: '',
  budget: '',
  gender: '',
  preferences: ''
};

// Chat flow questions
const chatFlow = [
  "What type of clothing are you looking for? (casual, formal, or partywear)",
  "What's your budget? (in ₹)",
  "Which gender do you want to shop for? (male/female)",
  "Do you have any preferred brands or colors?"
];

// Initialize dark mode
function initializeDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Initialize dark mode on page load
initializeDarkMode();

// Event Listeners
startShoppingBtn.addEventListener('click', startChat);
chatbotIcon.addEventListener('click', startChat);
closeChatbot.addEventListener('click', closeChat);
chatForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent form submission and page refresh
  handleUserInput();
});
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // Prevent form submission and page refresh
    handleUserInput();
  }
});
darkModeToggle.addEventListener('click', toggleDarkMode);

// Functions
function startChat() {
  // Hide welcome screen and show chat interface
  welcomeScreen.classList.add('hidden');
  chatInterface.classList.remove('hidden');
  chatbotIcon.classList.add('hidden');

  // Add welcome message
  addBotMessage("Hi! I'm your personal shopping assistant. Let me help you find the perfect outfit! 👗");

  // Start the conversation
  askNextQuestion();
}

function closeChat() {
  chatInterface.classList.add('hidden');
  chatbotIcon.classList.remove('hidden');
}

function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');

  // Update the dark mode toggle button icon
  const moonIcon = darkModeToggle.querySelector('.dark\\:hidden');
  const sunIcon = darkModeToggle.querySelector('.hidden.dark\\:block');

  if (isDarkMode) {
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  } else {
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  }
}

function handleUserInput() {
  const message = userInput.value.trim();
  if (!message) return;

  addUserMessage(message);
  userInput.value = '';

  // Store user's answer
  switch (currentStep) {
    case 0:
      userPreferences.clothingType = message;
      break;
    case 1:
      userPreferences.budget = message;
      break;
    case 2:
      userPreferences.gender = message;
      break;
    case 3:
      userPreferences.preferences = message;
      // After collecting all preferences, generate recommendations
      generateRecommendations();
      return;
  }

  currentStep++;
  if (currentStep < chatFlow.length) {
    askNextQuestion();
  }
}

function askNextQuestion() {
  setTimeout(() => {
    addBotMessage(chatFlow[currentStep]);
  }, 1000);
}

function addUserMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-bubble chat-bubble-user';
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-bubble chat-bubble-bot';

  // Add typing animation
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-animation';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  messageDiv.appendChild(typingDiv);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Replace typing animation with formatted message after delay
  setTimeout(() => {
    // Format the message with HTML
    const formattedMessage = formatMessage(message);
    messageDiv.innerHTML = formattedMessage;
  }, 1500);
}

function formatMessage(message) {
  // Replace markdown with HTML
  let formatted = message
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>');

  // Add section styling
  formatted = formatted.replace(/Outfit \d+: (.*?)(?=\n|$)/g, '<h2 style="color:#4CAF50;">$1</h2>');
  formatted = formatted.replace(/Style Suggestions:/g, '<h3 style="color:#2196F3;">Style Suggestions:</h3>');
  formatted = formatted.replace(/Where to Shop:/g, '<h3 style="color:#2196F3;">Where to Shop:</h3>');
  formatted = formatted.replace(/Shopping Tips:/g, '<h3 style="color:#2196F3;">Shopping Tips:</h3>');

  // Add emojis
  formatted = formatted.replace(/formal/g, 'formal 👔');
  formatted = formatted.replace(/casual/g, 'casual 👕');
  formatted = formatted.replace(/shirt/g, 'shirt 👔');
  formatted = formatted.replace(/trousers/g, 'trousers 👖');
  formatted = formatted.replace(/shoes/g, 'shoes 👞');
  formatted = formatted.replace(/budget/g, 'budget 💰');

  // Convert lists to HTML
  formatted = formatted.replace(/\n\s*\*\s(.*?)(?=\n|$)/g, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');

  // Add spacing between sections
  formatted = formatted.replace(/\n\n/g, '<br><br>');

  return formatted;
}

async function generateRecommendations() {
  addBotMessage("Generating personalized recommendations based on your preferences...");

  // Construct prompt for Gemini API
  const prompt = `Suggest 3 outfit options for a ${userPreferences.gender} user looking for ${userPreferences.clothingType} clothes under ₹${userPreferences.budget}. Additional preferences: ${userPreferences.preferences}. Please include specific style suggestions and general shopping tips.`;

  try {
    // Note: Replace YOUR_API_KEY with actual Gemini API key
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBaaL2F67ja7mUsT7G7RITalKgkTZfW9T8', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.candidates[0].content.parts[0].text;

    // Display recommendations
    addBotMessage(recommendations);
    addBotMessage("Would you like more specific recommendations or have any questions about the suggestions?");

  } catch (error) {
    console.error('Error:', error);
    addBotMessage("I apologize, but I'm having trouble generating recommendations right now. Please make sure you have a valid Gemini API key and try again later.");
  }
}

// Add custom styles for typing animation
const style = document.createElement('style');
style.textContent = `
    .typing-animation {
        display: flex;
        gap: 4px;
        padding: 4px;
    }
    
    .typing-animation span {
        width: 8px;
        height: 8px;
        background-color: #FF69B4;
        border-radius: 50%;
        animation: bounce 0.5s ease infinite;
    }
    
    .typing-animation span:nth-child(2) { animation-delay: 0.1s; }
    .typing-animation span:nth-child(3) { animation-delay: 0.2s; }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }
`;
document.head.appendChild(style); 
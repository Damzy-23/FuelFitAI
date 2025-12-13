# Using Voice Assistant Without OpenAI API Key

## ✅ Good News!

You can still use the voice assistant **without an OpenAI API key**! The assistant now has smart fallback responses that answer common questions about:
- Protein shakes
- Calories
- Workouts
- Macros (protein, carbs, fats)
- General nutrition questions

## 🎯 Current Setup (No API Key Needed)

The voice assistant will work with fallback responses. Just ask questions and you'll get helpful answers based on keyword detection.

**Example questions that work:**
- "Tell me about protein shake"
- "How many calories should I eat?"
- "What's the best workout?"
- "Explain macros"

## 🚀 Option 1: Get a Free OpenAI API Key (Recommended)

OpenAI offers **free credits** for new users:

1. **Sign up**: Go to https://platform.openai.com/signup
2. **Get $5 free credits** (enough for thousands of requests)
3. **Create API key**: Go to https://platform.openai.com/api-keys
4. **Add to `.env`**: 
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
5. **Restart server**

**Cost**: Free for new users, then pay-as-you-go (very cheap - ~$0.002 per request)

## 🔄 Option 2: Use Free Alternative AI Services

### A. Hugging Face Inference API (Free)
- **Free tier**: 1,000 requests/month
- **Setup**: Easy, just need API key
- **Quality**: Good for simple Q&A

### B. Cohere API (Free Tier)
- **Free tier**: 100 requests/month
- **Setup**: Sign up, get API key
- **Quality**: Excellent for conversational AI

### C. Google Gemini API (Free)
- **Free tier**: 60 requests/minute
- **Setup**: Google Cloud account
- **Quality**: Very good, similar to GPT

## 🛠️ Option 3: Use Local LLM (Advanced)

If you want to run AI completely free and offline:

1. **Ollama** (Easiest)
   - Install: https://ollama.ai
   - Run: `ollama run llama2`
   - Free, runs locally

2. **LM Studio** (Windows/Mac)
   - GUI for local LLMs
   - Download models, run locally
   - Completely free

## 💡 Option 4: Enhance Fallback Responses (Easiest)

I can expand the fallback responses to cover more topics. This requires no API keys and works immediately!

**Would you like me to:**
- Add more fallback responses for common questions?
- Create a knowledge base of nutrition facts?
- Add more detailed answers for specific topics?

## 🎯 Recommendation

**For now**: Use the current fallback responses - they work great for common questions!

**For best experience**: Get a free OpenAI API key (Option 1) - it's free for new users and gives you unlimited AI-powered responses.

**For completely free**: Use Hugging Face or Cohere free tiers (Option 2).

## 📝 Quick Setup (If You Get OpenAI Key)

1. Get key from https://platform.openai.com/api-keys
2. Edit `server/.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart server: `npm run dev` (in server folder)
4. Done! Voice assistant now has full AI capabilities.

## ❓ What Would You Like?

Let me know which option you prefer:
1. **Keep using fallback responses** (works now, no setup)
2. **Get free OpenAI key** (I can guide you)
3. **Add more fallback responses** (I can expand the knowledge base)
4. **Integrate alternative AI service** (I can set it up)

The voice assistant works great even without OpenAI - you'll just get pre-written but helpful responses instead of AI-generated ones!


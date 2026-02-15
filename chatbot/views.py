from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny  # 🚀 Chatbot ko 401 error se bachane ke liye
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from google import genai

# 🛑 YAHAN APNI NAYI WALI API KEY DAALIYE (Quotes ke andar)
API_KEY = "AIzaSyDU1H-hSM8Mu8SS1dxJv9yJtMMR-KoEd2o" 

try:
    client = genai.Client(api_key=API_KEY)
except Exception as e:
    print("❌ Client Setup Error:", e)
    client = None

@method_decorator(csrf_exempt, name='dispatch')
class AIChatAPI(APIView):
    permission_classes = [AllowAny] # 🚀 Isse 401 Unauthorized kabhi nahi aayega

    def post(self, request):
        if not client:
            return Response({"reply": "⚠️ Backend Error: API Key missing ya setup fail hua."})

        user_message = request.data.get('message', '').strip()

        if not user_message:
            return Response({"reply": "Please ask a question!"})

        try:
            full_prompt = (
                "Act as Shivadda AI, an expert educational tutor. Be polite, concise, and helpful.\n\n"
                f"User Question: {user_message}"
            )
            
            # 🚀 FIX: Wapas sabse latest model laga diya! Nayi key ke sath ye 100% chalega.
            response = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=full_prompt
            )

            if response.text:
                return Response({"reply": response.text})
            
            return Response({"reply": "Sorry, I couldn't generate a response right now."})

        except Exception as e:
            exact_error = str(e)
            print("❌ ASLI GOOGLE ERROR:", exact_error)
            
            # 🚀 AB ERROR HIDE NAHI HOGA! UI PAR EXACT ERROR DIKHEGA
            if "429" in exact_error or "RESOURCE_EXHAUSTED" in exact_error:
                 return Response({"reply": "⚠️ Limit Reached: Is key ki free limit khatam ho chuki hai."})
            elif "400" in exact_error or "API_KEY_INVALID" in exact_error:
                 return Response({"reply": "🚨 Invalid API Key: Please apni API key check karein."})
            else:
                 # Agar koi aur naya error aata hai, toh wo seedha chatbot screen par text ban kar aayega!
                 return Response({"reply": f"🤖 Google API Error: {exact_error}"})



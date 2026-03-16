# core/middleware.py
import datetime
from django.http import JsonResponse
from django.utils.timezone import now

class LicenseVerificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
        # 🔥 EXACT 6 MONTHS TIME (16 September 2026)
        self.EXPIRY_DATE = datetime.datetime(2026, 9, 16, tzinfo=datetime.timezone.utc)

    def __call__(self, request):
        
        if now() > self.EXPIRY_DATE:
            
            if request.path.startswith('/api/'):
                return JsonResponse({
                    "error": "License Expired",
                    "detail": "Your software license or AMC has expired. Please contact your developer to renew the services.",
                    "code": "LICENSE_EXPIRED"
                }, status=402) 

        
        
        response = self.get_response(request)
        return response
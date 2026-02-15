from django.apps import AppConfig

# backend/hostel/apps.py ke andar:
class HostelConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hostel'

    def ready(self):
        import hostel.signals
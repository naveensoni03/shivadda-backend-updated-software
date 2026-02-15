from django.contrib import admin
from .models import FeePlan, Installment, FeeTransaction

admin.site.register(FeePlan)
admin.site.register(Installment)
admin.site.register(FeeTransaction)
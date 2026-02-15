from django.urls import path
from .views import (
    FeeTransactionAPI, 
    StudentFeeLedgerAPI, 
    fee_summary, 
    download_fee_csv
)

urlpatterns = [
    # Admin / Staff Routes
    path("transactions/", FeeTransactionAPI.as_view(), name="fee-transactions"),
    path("summary/", fee_summary, name="fee-summary"),
    path("download-report/", download_fee_csv, name="download-fee-report"),

    # Student Route
    path("my-ledger/", StudentFeeLedgerAPI.as_view(), name="student-ledger"),
]
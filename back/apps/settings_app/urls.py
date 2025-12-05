"""
Settings URLs - /api/v1/settings/
"""
from django.urls import path
from .views import SettingsView, ChangePasswordView, Enable2FAView, Confirm2FAView

urlpatterns = [
    path('', SettingsView.as_view(), name='settings'),
    path('password/', ChangePasswordView.as_view(), name='settings_password'),
    path('2fa/enable/', Enable2FAView.as_view(), name='settings_2fa_enable'),
    path('2fa/confirm/', Confirm2FAView.as_view(), name='settings_2fa_confirm'),
]

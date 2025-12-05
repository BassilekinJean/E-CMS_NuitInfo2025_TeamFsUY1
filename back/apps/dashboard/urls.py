"""
Dashboard URLs - /api/v1/dashboard/
"""
from django.urls import path
from .views import DashboardStatsView, DashboardChartsView, DashboardActivitiesView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('charts/', DashboardChartsView.as_view(), name='dashboard_charts'),
    path('activities/', DashboardActivitiesView.as_view(), name='dashboard_activities'),
]

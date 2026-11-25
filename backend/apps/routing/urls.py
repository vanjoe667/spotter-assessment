from django.urls import path
from .views.route_views import RouteView

urlpatterns = [
    path("routes/", RouteView.as_view(), name="routes"),
]

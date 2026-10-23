from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    CurrentUserView,
    WishlistViewSet,
    DrawStatusView,
    PickDrawView,
    AdminOverviewView,
    AdminAutoMatchAllView,
    AdminResetMatchesView,
    AdminDeleteUserView,
)

router = DefaultRouter()
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='api-register'),
    path('auth/login/', LoginView.as_view(), name='api-login'),
    path('auth/me/', CurrentUserView.as_view(), name='api-me'),

    # Wishlist endpoints (GET list, POST create, PUT/DELETE item)
    path('', include(router.urls)),

    # Draw endpoints
    path('draw/status/', DrawStatusView.as_view(), name='api-draw-status'),
    path('draw/pick/', PickDrawView.as_view(), name='api-draw-pick'),

    # Admin endpoints
    path('admin/overview/', AdminOverviewView.as_view(), name='api-admin-overview'),
    path('admin/auto-match-all/', AdminAutoMatchAllView.as_view(), name='api-admin-auto-match'),
    path('admin/reset-matches/', AdminResetMatchesView.as_view(), name='api-admin-reset-matches'),
    path('admin/users/<int:user_id>/', AdminDeleteUserView.as_view(), name='api-admin-delete-user'),
]

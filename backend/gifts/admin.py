from django.contrib import admin
from .models import UserProfile, WishlistItem, SystemSetting


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('assigned_number', 'user', 'display_name', 'drawn_user_display', 'drawn_at', 'created_at')
    search_fields = ('assigned_number', 'user__username', 'display_name')
    list_filter = ('created_at',)

    def drawn_user_display(self, obj):
        if obj.drawn_user and hasattr(obj.drawn_user, 'profile'):
            return f"#{obj.drawn_user.profile.assigned_number} ({obj.drawn_user.username})"
        return "-"
    drawn_user_display.short_description = "Drawn Recipient"


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'priority', 'price_range', 'created_at')
    search_fields = ('title', 'user__username', 'description')
    list_filter = ('priority', 'created_at')


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'is_draw_active', 'min_wishlist_items', 'updated_at')

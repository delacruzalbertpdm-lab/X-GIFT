from django.contrib import admin
from .models import (
    UserProfile,
    WishlistItem,
    SystemSetting,
    VerificationQuestion,
    GiftBatch,
    BatchParticipant,
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('assigned_number', 'user', 'display_name', 'quiz_completed', 'is_verified_true_hamster', 'created_at')
    search_fields = ('assigned_number', 'user__username', 'display_name')
    list_filter = ('quiz_completed', 'is_verified_true_hamster', 'created_at')


@admin.register(GiftBatch)
class GiftBatchAdmin(admin.ModelAdmin):
    list_display = ('title', 'budget_range', 'target_date', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'target_date', 'created_at')
    search_fields = ('title', 'description')


@admin.register(BatchParticipant)
class BatchParticipantAdmin(admin.ModelAdmin):
    list_display = ('batch', 'user', 'drawn_at', 'joined_at')
    list_filter = ('batch', 'joined_at')
    search_fields = ('user__username', 'batch__title')


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'batch', 'priority', 'price_range', 'created_at')
    search_fields = ('title', 'user__username', 'description')
    list_filter = ('batch', 'priority', 'created_at')


@admin.register(VerificationQuestion)
class VerificationQuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'correct_option', 'is_active', 'created_at')
    list_filter = ('is_active', 'correct_option')
    search_fields = ('question_text', 'explanation')


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'is_draw_active', 'min_wishlist_items', 'updated_at')

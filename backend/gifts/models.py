import random
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


def generate_unique_lucky_number():
    """Generates a random unique number between 101 and 9999."""
    for _ in range(1000):
        number = random.randint(101, 9999)
        if not UserProfile.objects.filter(assigned_number=number).exists():
            return number
    # Fallback to sequential increment if range gets saturated
    last_profile = UserProfile.objects.order_by('-assigned_number').first()
    return (last_profile.assigned_number + 1) if last_profile else 101


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    assigned_number = models.PositiveIntegerField(unique=True, db_index=True)
    
    # The person this user is giving gifts to (drawn recipient)
    drawn_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='drawn_by_profiles'
    )
    drawn_at = models.DateTimeField(null=True, blank=True)
    phone_number = models.CharField(max_length=30, blank=True, default='')
    display_name = models.CharField(max_length=150, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # La Familia Hamster Verification Quiz
    quiz_completed = models.BooleanField(default=False)
    is_verified_true_hamster = models.BooleanField(default=False)
    quiz_score = models.IntegerField(default=0)
    quiz_total = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.assigned_number:
            self.assigned_number = generate_unique_lucky_number()
        if not self.display_name and self.user:
            self.display_name = self.user.get_full_name() or self.user.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.assigned_number} - {self.display_name or self.user.username}"


class VerificationQuestion(models.Model):
    """Admin-configured trivia questions to verify if user is true La Familia Hamster Corp."""
    question_text = models.CharField(max_length=500)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255, blank=True, default='')
    option_d = models.CharField(max_length=255, blank=True, default='')
    correct_option = models.CharField(max_length=2, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    explanation = models.CharField(max_length=255, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.question_text


class WishlistItem(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Top Priority / Most Wanted'),
        (2, 'Nice to Have'),
        (3, 'Alternative Option'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    price_range = models.CharField(max_length=100, blank=True, default='')
    item_url = models.URLField(max_length=500, blank=True, default='')
    priority = models.PositiveSmallIntegerField(choices=PRIORITY_CHOICES, default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.user.username})"


class SystemSetting(models.Model):
    """Global configuration for the exchange gift event."""
    event_name = models.CharField(max_length=200, default='Kris Kringle Exchange Gift')
    is_draw_active = models.BooleanField(default=True)
    min_wishlist_items = models.PositiveIntegerField(default=1)
    allow_redraw = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_settings(cls):
        setting, _ = cls.objects.get_or_create(id=1)
        return setting

    def __str__(self):
        return self.event_name

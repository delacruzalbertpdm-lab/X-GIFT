from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, WishlistItem, SystemSetting, VerificationQuestion, GiftBatch, BatchParticipant


class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = ['id', 'batch', 'title', 'description', 'price_range', 'item_url', 'priority', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BatchParticipantSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.SerializerMethodField()
    assigned_number = serializers.SerializerMethodField()
    wishlist_count = serializers.SerializerMethodField()
    has_drawn = serializers.SerializerMethodField()
    drawn_user_assigned_number = serializers.SerializerMethodField()
    drawn_user_name = serializers.SerializerMethodField()

    class Meta:
        model = BatchParticipant
        fields = [
            'id',
            'user_id',
            'username',
            'display_name',
            'assigned_number',
            'wishlist_count',
            'has_drawn',
            'drawn_user_assigned_number',
            'drawn_user_name',
            'drawn_at',
            'joined_at',
        ]

    def get_display_name(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.display_name or obj.user.get_full_name() or obj.user.username
        return obj.user.username

    def get_assigned_number(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.assigned_number
        return None

    def get_wishlist_count(self, obj):
        return WishlistItem.objects.filter(user=obj.user, batch=obj.batch).count()

    def get_has_drawn(self, obj):
        return obj.drawn_user is not None

    def get_drawn_user_assigned_number(self, obj):
        if obj.drawn_user and hasattr(obj.drawn_user, 'profile'):
            return obj.drawn_user.profile.assigned_number
        return None

    def get_drawn_user_name(self, obj):
        if obj.drawn_user and hasattr(obj.drawn_user, 'profile'):
            return obj.drawn_user.profile.display_name or obj.drawn_user.get_full_name() or obj.drawn_user.username
        return None


class GiftBatchSerializer(serializers.ModelSerializer):
    participants_count = serializers.SerializerMethodField()
    wishlists_count = serializers.SerializerMethodField()
    matched_count = serializers.SerializerMethodField()
    is_joined = serializers.SerializerMethodField()
    my_matched_recipient = serializers.SerializerMethodField()

    class Meta:
        model = GiftBatch
        fields = [
            'id',
            'title',
            'description',
            'budget_range',
            'target_date',
            'min_wishlist_items',
            'status',
            'participants_count',
            'wishlists_count',
            'matched_count',
            'is_joined',
            'my_matched_recipient',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_participants_count(self, obj):
        return obj.participants.count()

    def get_wishlists_count(self, obj):
        return obj.wishlist_items.count()

    def get_matched_count(self, obj):
        return obj.participants.filter(drawn_user__isnull=False).count()

    def get_is_joined(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False

    def get_my_matched_recipient(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        participant = obj.participants.filter(user=request.user).first()
        if participant and participant.drawn_user:
            recipient = participant.drawn_user
            wishlist = WishlistItem.objects.filter(user=recipient, batch=obj)
            return {
                'id': recipient.id,
                'assigned_number': getattr(recipient.profile, 'assigned_number', None) if hasattr(recipient, 'profile') else None,
                'display_name': recipient.profile.display_name or recipient.get_full_name() or recipient.username if hasattr(recipient, 'profile') else recipient.username,
                'wishlist': WishlistItemSerializer(wishlist, many=True).data,
                'matched_at': participant.drawn_at,
            }
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    
    drawn_user_assigned_number = serializers.SerializerMethodField()
    drawn_user_name = serializers.SerializerMethodField()
    wishlist_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'display_name',
            'email',
            'assigned_number',
            'is_staff',
            'phone_number',
            'drawn_at',
            'drawn_user_assigned_number',
            'drawn_user_name',
            'wishlist_count',
            'quiz_completed',
            'is_verified_true_hamster',
            'quiz_score',
            'quiz_total',
            'created_at',
        ]

    def get_drawn_user_assigned_number(self, obj):
        if obj.drawn_user and hasattr(obj.drawn_user, 'profile'):
            return obj.drawn_user.profile.assigned_number
        return None

    def get_drawn_user_name(self, obj):
        if obj.drawn_user and hasattr(obj.drawn_user, 'profile'):
            return obj.drawn_user.profile.display_name or obj.drawn_user.get_full_name() or obj.drawn_user.username
        return None

    def get_wishlist_count(self, obj):
        return obj.user.wishlist_items.count()


class DrawnUserRecipientSerializer(serializers.ModelSerializer):
    """Details of the drawn user and their wishlist shown to the giver."""
    assigned_number = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    wishlist = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'assigned_number', 'display_name', 'wishlist']

    def get_assigned_number(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.assigned_number
        return None

    def get_display_name(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.display_name or obj.get_full_name() or obj.username
        return obj.username

    def get_wishlist(self, obj):
        items = obj.wishlist_items.all()
        return WishlistItemSerializer(items, many=True).data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    display_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'email', 'display_name']

    def create(self, validated_data):
        display_name = validated_data.pop('display_name', '')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # UserProfile is created with unique lucky number
        profile_name = display_name or user.get_full_name() or user.username
        UserProfile.objects.create(
            user=user,
            display_name=profile_name
        )
        return user


class AdminUserOverviewSerializer(serializers.ModelSerializer):
    """Comprehensive detail for admin to monitor all participants."""
    assigned_number = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    drawn_user_number = serializers.SerializerMethodField()
    drawn_user_name = serializers.SerializerMethodField()
    drawn_by_user_number = serializers.SerializerMethodField()
    drawn_by_user_name = serializers.SerializerMethodField()
    wishlist = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'is_staff',
            'date_joined',
            'assigned_number',
            'display_name',
            'drawn_user_number',
            'drawn_user_name',
            'drawn_by_user_number',
            'drawn_by_user_name',
            'quiz_completed',
            'is_verified_true_hamster',
            'quiz_score',
            'quiz_total',
            'wishlist',
        ]

    quiz_completed = serializers.BooleanField(source='profile.quiz_completed', default=False, read_only=True)
    is_verified_true_hamster = serializers.BooleanField(source='profile.is_verified_true_hamster', default=False, read_only=True)
    quiz_score = serializers.IntegerField(source='profile.quiz_score', default=0, read_only=True)
    quiz_total = serializers.IntegerField(source='profile.quiz_total', default=0, read_only=True)

    def get_assigned_number(self, obj):
        return obj.profile.assigned_number if hasattr(obj, 'profile') else None

    def get_display_name(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.display_name or obj.get_full_name() or obj.username
        return obj.username

    def get_drawn_user_number(self, obj):
        if hasattr(obj, 'profile') and obj.profile.drawn_user:
            return getattr(obj.profile.drawn_user.profile, 'assigned_number', None)
        return None

    def get_drawn_user_name(self, obj):
        if hasattr(obj, 'profile') and obj.profile.drawn_user:
            target = obj.profile.drawn_user
            return target.profile.display_name if hasattr(target, 'profile') else target.username
        return None

    def get_drawn_by_user_number(self, obj):
        # Who has drawn this user?
        giver_profile = obj.drawn_by_profiles.first()
        if giver_profile:
            return giver_profile.assigned_number
        return None

    def get_drawn_by_user_name(self, obj):
        giver_profile = obj.drawn_by_profiles.first()
        if giver_profile:
            return giver_profile.display_name or giver_profile.user.username
        return None

    def get_wishlist(self, obj):
        return WishlistItemSerializer(obj.wishlist_items.all(), many=True).data


class VerificationQuestionPublicSerializer(serializers.ModelSerializer):
    """Public version shown to participants without giving away the correct answer."""
    class Meta:
        model = VerificationQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d']


class VerificationQuestionAdminSerializer(serializers.ModelSerializer):
    """Full question details for admin management."""
    class Meta:
        model = VerificationQuestion
        fields = [
            'id',
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_option',
            'explanation',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

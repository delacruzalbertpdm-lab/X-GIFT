import random
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets, permissions
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile, WishlistItem, SystemSetting
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    WishlistItemSerializer,
    DrawnUserRecipientSerializer,
    AdminUserOverviewSerializer
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            profile_data = UserProfileSerializer(user.profile).data
            return Response({
                'token': token.key,
                'user': profile_data,
                'message': f'Registration successful! Your Lucky Number is #{user.profile.assigned_number}.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Ensure user profile exists
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)

        token, _ = Token.objects.get_or_create(user=user)
        profile_data = UserProfileSerializer(user.profile).data
        return Response({
            'token': token.key,
            'user': profile_data,
            'message': 'Login successful!'
        })


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile'):
            UserProfile.objects.create(user=request.user)
        profile_data = UserProfileSerializer(request.user.profile).data
        return Response(profile_data)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DrawStatusView(APIView):
    """Checks whether the current user can draw a number or returns their already drawn recipient."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)
        profile = user.profile

        if user.is_staff:
            return Response({
                'is_admin_monitor': True,
                'has_drawn': False,
                'can_draw': False,
                'message': 'Admin account is in system monitoring mode and excluded from the exchange pool.'
            })

        settings = SystemSetting.get_settings()
        wishlist_count = user.wishlist_items.count()
        other_users_count = UserProfile.objects.filter(user__is_staff=False).exclude(user=user).count()

        # If user has already drawn someone
        if profile.drawn_user:
            recipient_data = DrawnUserRecipientSerializer(profile.drawn_user).data
            return Response({
                'has_drawn': True,
                'recipient': recipient_data,
                'drawn_at': profile.drawn_at,
                'wishlist_count': wishlist_count,
                'min_required': settings.min_wishlist_items,
                'can_draw': False,
                'message': f"You drew Number #{recipient_data['assigned_number']}!"
            })

        # User hasn't drawn yet
        has_min_wishlist = wishlist_count >= settings.min_wishlist_items
        can_draw = has_min_wishlist and other_users_count > 0 and settings.is_draw_active

        message = ""
        if not settings.is_draw_active:
            message = "The lucky gift draw is currently paused by the admin."
        elif not has_min_wishlist:
            message = f"Please add at least {settings.min_wishlist_items} item(s) to your wishlist before drawing!"
        elif other_users_count == 0:
            message = "You are currently the first registered participant! Wait for other members to join."
        else:
            message = "You're ready to pick a random number! Tap Draw below."

        return Response({
            'has_drawn': False,
            'recipient': None,
            'wishlist_count': wishlist_count,
            'min_required': settings.min_wishlist_items,
            'other_users_count': other_users_count,
            'can_draw': can_draw,
            'message': message,
        })


class PickDrawView(APIView):
    """Draws a random number / participant for the user."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        if user.is_staff:
            return Response({'error': 'Admin accounts are in monitoring mode and do not participate in gift draws.'}, status=status.HTTP_400_BAD_REQUEST)

        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)
        profile = user.profile

        settings = SystemSetting.get_settings()
        if not settings.is_draw_active:
            return Response({'error': 'Draw is currently paused by admin.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check existing draw
        if profile.drawn_user and not settings.allow_redraw:
            recipient_data = DrawnUserRecipientSerializer(profile.drawn_user).data
            return Response({
                'already_drawn': True,
                'recipient': recipient_data,
                'message': f"You have already drawn Number #{recipient_data['assigned_number']}!"
            })

        # Validate minimum wishlist items
        wishlist_count = user.wishlist_items.count()
        if wishlist_count < settings.min_wishlist_items:
            return Response({
                'error': f'Please add at least {settings.min_wishlist_items} item(s) to your wishlist before drawing.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Candidate pool: registered non-staff participants excluding self
        candidate_profiles = UserProfile.objects.filter(user__is_staff=False).exclude(user=user)
        if not candidate_profiles.exists():
            return Response({
                'error': 'No other participants registered yet. Invite someone to register!'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Priority 1: Candidates who haven't been drawn by anyone yet
        available_profiles = candidate_profiles.filter(user__drawn_by_profiles__isnull=True)
        
        # If possible, also avoid reciprocal immediate pairs if more than 2 participants
        if candidate_profiles.count() > 2:
            non_reciprocal = available_profiles.exclude(drawn_user=user)
            if non_reciprocal.exists():
                available_profiles = non_reciprocal

        chosen_profile = None
        if available_profiles.exists():
            chosen_profile = random.choice(list(available_profiles))
        else:
            # Fallback to any other candidate if all have been drawn once
            chosen_profile = random.choice(list(candidate_profiles))

        profile.drawn_user = chosen_profile.user
        profile.drawn_at = timezone.now()
        profile.save()

        recipient_data = DrawnUserRecipientSerializer(chosen_profile.user).data
        return Response({
            'success': True,
            'recipient': recipient_data,
            'message': f"🎉 Congratulations! You picked Number #{chosen_profile.assigned_number}!"
        })


class AdminOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        participants = User.objects.filter(is_staff=False).select_related('profile').prefetch_related('wishlist_items', 'drawn_by_profiles')
        users_data = AdminUserOverviewSerializer(participants, many=True).data

        total_users = participants.count()
        total_wishlists = WishlistItem.objects.filter(user__is_staff=False).count()
        matched_count = UserProfile.objects.filter(user__is_staff=False, drawn_user__isnull=False).count()
        unmatched_count = total_users - matched_count

        return Response({
            'stats': {
                'total_users': total_users,
                'total_wishlists': total_wishlists,
                'matched_count': matched_count,
                'unmatched_count': unmatched_count,
            },
            'users': users_data,
            'settings': {
                'event_name': SystemSetting.get_settings().event_name,
                'is_draw_active': SystemSetting.get_settings().is_draw_active,
                'min_wishlist_items': SystemSetting.get_settings().min_wishlist_items,
            }
        })


class AdminAutoMatchAllView(APIView):
    """Performs fair circular derangement matching for all participants."""
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request):
        # Match only non-staff participants
        profiles = list(UserProfile.objects.select_related('user').filter(user__is_staff=False))
        if len(profiles) < 2:
            return Response({'error': 'Need at least 2 non-admin participants to perform auto matching.'}, status=status.HTTP_400_BAD_REQUEST)

        # Shuffle profiles to create a random closed cycle: P[0] -> P[1] -> P[2] ... -> P[0]
        # This guarantees 100% fair Secret Santa: no self-picks, every person gives to 1 and receives from 1
        random.shuffle(profiles)
        now = timezone.now()

        for i in range(len(profiles)):
            giver = profiles[i]
            receiver = profiles[(i + 1) % len(profiles)]
            giver.drawn_user = receiver.user
            giver.drawn_at = now
            giver.save()

        return Response({
            'success': True,
            'message': f'Successfully matched all {len(profiles)} participants in a closed gift exchange cycle!'
        })


class AdminResetMatchesView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        target_user_id = request.data.get('user_id')
        if target_user_id:
            profile = UserProfile.objects.filter(user_id=target_user_id).first()
            if profile:
                profile.drawn_user = None
                profile.drawn_at = None
                profile.save()
                return Response({'message': f'Reset draw match for user #{profile.assigned_number}.'})
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Reset all
        UserProfile.objects.all().update(drawn_user=None, drawn_at=None)
        return Response({'message': 'All gift exchange matches have been reset.'})


class AdminDeleteUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, user_id):
        if request.user.id == int(user_id):
            return Response({'error': 'You cannot delete your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            # Remove any references where this user is drawn by someone else
            UserProfile.objects.filter(drawn_user=user).update(drawn_user=None, drawn_at=None)
            user.delete()
            return Response({'message': 'Participant successfully deleted.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

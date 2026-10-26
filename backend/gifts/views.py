import random
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets, permissions
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile, WishlistItem, SystemSetting, VerificationQuestion, GiftBatch, BatchParticipant
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    WishlistItemSerializer,
    DrawnUserRecipientSerializer,
    AdminUserOverviewSerializer,
    VerificationQuestionPublicSerializer,
    VerificationQuestionAdminSerializer,
    GiftBatchSerializer,
    BatchParticipantSerializer,
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
        qs = WishlistItem.objects.filter(user=self.request.user)
        batch_id = self.request.query_params.get('batch')
        if batch_id:
            qs = qs.filter(batch_id=batch_id)
        return qs

    def perform_create(self, serializer):
        batch_id = self.request.data.get('batch')
        batch = None
        if batch_id:
            batch = GiftBatch.objects.filter(id=batch_id).first()
        serializer.save(user=self.request.user, batch=batch)


class GiftBatchViewSet(viewsets.ModelViewSet):
    queryset = GiftBatch.objects.all()
    serializer_class = GiftBatchSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'join']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        batch = self.get_object()
        if batch.status != 'open':
            return Response({'error': 'This event is no longer open for registration.'}, status=status.HTTP_400_BAD_REQUEST)

        participant, created = BatchParticipant.objects.get_or_create(
            batch=batch,
            user=request.user
        )
        return Response({
            'success': True,
            'created': created,
            'message': f'You have joined "{batch.title}"!'
        })

    @action(detail=True, methods=['post'])
    def match(self, request, pk=None):
        batch = self.get_object()
        participants = list(batch.participants.select_related('user', 'user__profile').all())
        if len(participants) < 2:
            return Response(
                {'error': f'Need at least 2 participants in "{batch.title}" to match. Currently only {len(participants)} joined.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fair circular derangement: no self-picks, guaranteed closed cycle
        random.shuffle(participants)
        now = timezone.now()

        with transaction.atomic():
            for i in range(len(participants)):
                giver = participants[i]
                receiver = participants[(i + 1) % len(participants)]
                giver.drawn_user = receiver.user
                giver.drawn_at = now
                giver.save()

            batch.status = 'matched'
            batch.save()

        return Response({
            'success': True,
            'message': f'🎉 Successfully matched all {len(participants)} participants in "{batch.title}"!'
        })

    @action(detail=True, methods=['post'])
    def reset_matches(self, request, pk=None):
        batch = self.get_object()
        with transaction.atomic():
            batch.participants.update(drawn_user=None, drawn_at=None)
            batch.status = 'open'
            batch.save()

        return Response({
            'success': True,
            'message': f'Matches for "{batch.title}" have been reset.'
        })

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        batch = self.get_object()
        participants = batch.participants.select_related('user', 'user__profile', 'drawn_user', 'drawn_user__profile').all()
        serializer = BatchParticipantSerializer(participants, many=True)
        return Response(serializer.data)


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
        batch_id = request.query_params.get('batch')
        batches = list(GiftBatch.objects.all().values('id', 'title', 'budget_range', 'target_date', 'status', 'created_at'))

        selected_batch = None
        if batch_id and batch_id != 'all':
            selected_batch = GiftBatch.objects.filter(id=batch_id).first()
        if not selected_batch:
            selected_batch = GiftBatch.objects.first()

        if selected_batch:
            # Batch-scoped participants
            batch_participants = selected_batch.participants.select_related(
                'user', 'user__profile', 'drawn_user', 'drawn_user__profile'
            ).all()

            users_data = []
            for bp in batch_participants:
                u = bp.user
                profile = getattr(u, 'profile', None)

                # Who gave to this user in this batch?
                giver_bp = selected_batch.participants.filter(drawn_user=u).select_related('user', 'user__profile').first()
                drawn_by_user_number = getattr(giver_bp.user.profile, 'assigned_number', None) if (giver_bp and hasattr(giver_bp.user, 'profile')) else None
                drawn_by_user_name = giver_bp.user.profile.display_name if (giver_bp and hasattr(giver_bp.user, 'profile')) else (giver_bp.user.username if giver_bp else None)

                # Who does this user give to in this batch?
                drawn_user_number = getattr(bp.drawn_user.profile, 'assigned_number', None) if (bp.drawn_user and hasattr(bp.drawn_user, 'profile')) else None
                drawn_user_name = bp.drawn_user.profile.display_name if (bp.drawn_user and hasattr(bp.drawn_user, 'profile')) else (bp.drawn_user.username if bp.drawn_user else None)

                # Wishlist items for this batch
                items = WishlistItem.objects.filter(user=u, batch=selected_batch)
                wishlist_data = WishlistItemSerializer(items, many=True).data

                users_data.append({
                    'id': u.id,
                    'username': u.username,
                    'first_name': u.first_name,
                    'last_name': u.last_name,
                    'email': u.email,
                    'is_staff': u.is_staff,
                    'date_joined': u.date_joined,
                    'assigned_number': getattr(profile, 'assigned_number', None) if profile else None,
                    'display_name': getattr(profile, 'display_name', '') or u.get_full_name() or u.username if profile else u.username,
                    'drawn_user_number': drawn_user_number,
                    'drawn_user_name': drawn_user_name,
                    'drawn_by_user_number': drawn_by_user_number,
                    'drawn_by_user_name': drawn_by_user_name,
                    'quiz_completed': getattr(profile, 'quiz_completed', False) if profile else False,
                    'is_verified_true_hamster': getattr(profile, 'is_verified_true_hamster', False) if profile else False,
                    'quiz_score': getattr(profile, 'quiz_score', 0) if profile else 0,
                    'quiz_total': getattr(profile, 'quiz_total', 0) if profile else 0,
                    'wishlist': wishlist_data,
                })

            total_users = batch_participants.count()
            total_wishlists = WishlistItem.objects.filter(batch=selected_batch).count()
            matched_count = selected_batch.participants.filter(drawn_user__isnull=False).count()
            unmatched_count = total_users - matched_count

            batch_info = {
                'id': selected_batch.id,
                'title': selected_batch.title,
                'budget_range': selected_batch.budget_range,
                'target_date': selected_batch.target_date,
                'status': selected_batch.status,
            }
        else:
            total_users = 0
            total_wishlists = 0
            matched_count = 0
            unmatched_count = 0
            users_data = []
            batch_info = None

        return Response({
            'stats': {
                'total_users': total_users,
                'total_wishlists': total_wishlists,
                'matched_count': matched_count,
                'unmatched_count': unmatched_count,
                'total_batches': len(batches),
            },
            'users': users_data,
            'batches': batches,
            'selected_batch': batch_info,
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


# --- Hamster Verification Quiz Views ---

class QuizQuestionsView(APIView):
    """Returns active quiz questions for participants to prove they are true Hamster Corp members."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        questions = VerificationQuestion.objects.filter(is_active=True)
        serializer = VerificationQuestionPublicSerializer(questions, many=True)
        return Response({
            'questions': serializer.data,
            'quiz_completed': getattr(request.user.profile, 'quiz_completed', False),
            'is_verified_true_hamster': getattr(request.user.profile, 'is_verified_true_hamster', False),
            'quiz_score': getattr(request.user.profile, 'quiz_score', 0),
            'quiz_total': getattr(request.user.profile, 'quiz_total', 0),
        })


class QuizSubmitView(APIView):
    """Evaluates answers and records whether participant passed or failed."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        answers = request.data.get('answers', {})
        active_questions = VerificationQuestion.objects.filter(is_active=True)
        total = active_questions.count()
        score = 0

        for q in active_questions:
            # Handle both string and int keys in answers dict
            ans = str(answers.get(str(q.id), answers.get(q.id, ''))).strip().upper()
            if ans and ans == q.correct_option.strip().upper():
                score += 1

        # Verified True Hamster if all questions answered correctly (or if no questions exist)
        is_verified = (score == total) if total > 0 else True

        profile = request.user.profile
        profile.quiz_completed = True
        profile.is_verified_true_hamster = is_verified
        profile.quiz_score = score
        profile.quiz_total = total
        profile.save()

        if is_verified:
            msg = "Certified True La Familia Hamster Corp Member! 🐹👑✨"
        else:
            msg = "You're not true La Familia Hamster Corp 🐹❌"

        return Response({
            'quiz_completed': True,
            'is_verified_true_hamster': is_verified,
            'quiz_score': score,
            'quiz_total': total,
            'message': msg,
        })


class AdminQuestionViewSet(viewsets.ModelViewSet):
    """Admin CRUD management for Hamster Verification Quiz questions."""
    permission_classes = [permissions.IsAdminUser]
    queryset = VerificationQuestion.objects.all()
    serializer_class = VerificationQuestionAdminSerializer


class AdminResetUserQuizView(APIView):
    """Admin can reset a user's quiz so they can retake the verification test."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, user_id):
        profile = UserProfile.objects.filter(user_id=user_id).first()
        if not profile:
            return Response({'error': 'User profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile.quiz_completed = False
        profile.is_verified_true_hamster = False
        profile.quiz_score = 0
        profile.quiz_total = 0
        profile.save()
        return Response({'message': f'Quiz verification reset for user #{profile.assigned_number}.'})

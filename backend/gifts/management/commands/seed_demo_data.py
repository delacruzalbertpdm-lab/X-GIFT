from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from gifts.models import UserProfile, WishlistItem, SystemSetting


class Command(BaseCommand):
    help = 'Seeds initial admin and sample participants with wishlists for demo'

    def handle(self, *args, **options):
        # 1. Ensure SystemSetting
        setting = SystemSetting.get_settings()
        setting.event_name = "Holiday Kris Kringle 2026"
        setting.is_draw_active = True
        setting.min_wishlist_items = 1
        setting.save()

        # 2. Create Admin user
        admin_user, created = User.objects.get_or_create(username='admin')
        admin_user.set_password('admin123')
        admin_user.first_name = 'System'
        admin_user.last_name = 'Admin'
        admin_user.email = 'admin@exchangegift.local'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

        if not hasattr(admin_user, 'profile'):
            UserProfile.objects.create(user=admin_user, display_name='System Admin')

        self.stdout.write(self.style.SUCCESS(f'Admin ready: admin / admin123 (Lucky #{admin_user.profile.assigned_number})'))

        # 3. Demo participants
        demo_users = [
            {
                'username': 'maria_s',
                'password': 'password123',
                'first_name': 'Maria',
                'last_name': 'Santos',
                'display_name': 'Maria Santos',
                'wishes': [
                    {'title': 'Scented Soy Candle (Lavender & Vanilla)', 'description': 'Relaxing scent for bedroom, prefer glass jar', 'price_range': '₱300 - ₱500', 'priority': 1},
                    {'title': 'Wireless Ergonomic Mouse', 'description': 'Rechargeable, silent click for laptop', 'price_range': '₱600 - ₱900', 'priority': 2},
                    {'title': 'Cute Ceramic Coffee Mug', 'description': 'Matte pastel color', 'price_range': '₱250 - ₱400', 'priority': 3},
                ]
            },
            {
                'username': 'juan_d',
                'password': 'password123',
                'first_name': 'Juan',
                'last_name': 'Dela Cruz',
                'display_name': 'Juan Dela Cruz',
                'wishes': [
                    {'title': 'Insulated Stainless Tumbler (32oz)', 'description': 'Hydro Flask or AquaFlask style, dark green or black', 'price_range': '₱700 - ₱1,100', 'priority': 1},
                    {'title': 'Drip Coffee Bean Sampler Pack', 'description': 'Medium or dark roast arabica beans (Sagada/Benguet)', 'price_range': '₱350 - ₱600', 'priority': 2},
                ]
            },
            {
                'username': 'claire_r',
                'password': 'password123',
                'first_name': 'Claire',
                'last_name': 'Reyes',
                'display_name': 'Claire Reyes',
                'wishes': [
                    {'title': 'Mechanical Keyboard Keycaps Set', 'description': 'OEM profile or Cherry profile, matcha/minimalist theme', 'price_range': '₱800 - ₱1,200', 'priority': 1},
                    {'title': 'Desk Mat / Extended Mousepad', 'description': 'Waterproof cloth, 900x400mm', 'price_range': '₱350 - ₱500', 'priority': 2},
                    {'title': 'Fuzzy Warm Socks (3 pairs)', 'description': 'Cozy socks for cold aircon room', 'price_range': '₱200 - ₱300', 'priority': 3},
                ]
            },
            {
                'username': 'mark_b',
                'password': 'password123',
                'first_name': 'Mark',
                'last_name': 'Bautista',
                'display_name': 'Mark Bautista',
                'wishes': [
                    {'title': 'Quick Dry Sports Gym Towel & Gym Bag', 'description': 'Compact microfiber towel', 'price_range': '₱400 - ₱700', 'priority': 1},
                    {'title': 'Portable Power Bank (10,000mAh)', 'description': 'Fast charging USB-C output', 'price_range': '₱800 - ₱1,200', 'priority': 2},
                ]
            }
        ]

        for udata in demo_users:
            u, created = User.objects.get_or_create(username=udata['username'])
            u.set_password(udata['password'])
            u.first_name = udata['first_name']
            u.last_name = udata['last_name']
            u.email = f"{udata['username']}@example.com"
            u.save()

            if not hasattr(u, 'profile'):
                UserProfile.objects.create(user=u, display_name=udata['display_name'])
            else:
                u.profile.display_name = udata['display_name']
                u.profile.save()

            # Seed wishlist
            if not u.wishlist_items.exists():
                for item in udata['wishes']:
                    WishlistItem.objects.create(
                        user=u,
                        title=item['title'],
                        description=item['description'],
                        price_range=item['price_range'],
                        priority=item['priority']
                    )

            self.stdout.write(self.style.SUCCESS(f"Participant ready: {u.username} (Number #{u.profile.assigned_number}) with {u.wishlist_items.count()} wishes"))

        self.stdout.write(self.style.SUCCESS('Seeding demo data completed successfully!'))

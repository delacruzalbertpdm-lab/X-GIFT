from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse, JsonResponse

def root_status_view(request):
    if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krismon API — Backend Running</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            max-width: 520px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.3);
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 10px #22c55e;
        }
        h1 { font-size: 26px; font-weight: 700; margin-bottom: 12px; }
        p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
        .buttons { display: flex; flex-direction: column; gap: 12px; }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 13px 20px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(225, 29, 72, 0.6);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.14);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge"><span class="dot"></span> Backend Active &amp; Ready</div>
        <h1>🎁 Krismon Backend API</h1>
        <p>The Django REST Framework server is running smoothly! To experience the Gift Exchange app, open the Frontend web application.</p>
        <div class="buttons">
            <a href="http://localhost:5173" class="btn btn-primary">🚀 Open Frontend App (Port 5173)</a>
            <a href="/admin/" class="btn btn-secondary">⚙️ Django Admin Panel</a>
        </div>
    </div>
</body>
</html>"""
        return HttpResponse(html_content)
    return JsonResponse({
        'status': 'online',
        'message': 'Krismon Exchange Gift API is operational',
        'frontend_url': 'http://localhost:5173',
        'admin_url': '/admin/',
    })

urlpatterns = [
    path('', root_status_view, name='root-status'),
    path('admin/', admin.site.urls),
    path('api/', include('gifts.urls')),
]


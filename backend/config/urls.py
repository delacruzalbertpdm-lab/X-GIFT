from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from django.http import HttpResponse, FileResponse

FRONTEND_DIST = settings.BASE_DIR.parent / 'frontend' / 'dist'

def serve_react_app(request, path=""):
    # If a specific static file inside frontend/dist is requested (e.g. hamster_hero.png, favicon.svg)
    if path:
        target = FRONTEND_DIST / path
        if target.is_file():
            return FileResponse(open(target, 'rb'))

    # Otherwise serve index.html (React handles routing and displays the Login screen)
    index_file = FRONTEND_DIST / 'index.html'
    if index_file.exists():
        return FileResponse(open(index_file, 'rb'))

    return HttpResponse(
        "<h1>Frontend build not found</h1><p>Run <code>npm run build</code> inside the frontend directory.</p>",
        status=404
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('gifts.urls')),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': FRONTEND_DIST / 'assets'}),
    re_path(r'^(?P<path>.*)$', serve_react_app),
]

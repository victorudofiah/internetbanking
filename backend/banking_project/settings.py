from pathlib import Path
import environ
import os

# Initialize environ
env = environ.Env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Take environment variables from .env file (located one level up in parent folder)
environ.Env.read_env(os.path.join(BASE_DIR.parent, '.env'))

# Quick-start development settings - unsuitable for production
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# backend/banking_project/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('POSTGRES_DB'),
        'USER': env('POSTGRES_USER'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': env('POSTGRES_HOST'),
        'PORT': env('POSTGRES_PORT'),
    }
}

# backend/banking_project/settings.py

# ... other settings

ROOT_URLCONF = 'banking_project.urls'

# ... other settings
AUTH_USER_MODEL = 'users.CustomUser'

# backend/banking_project/settings.py

INSTALLED_APPS = [
    # Django Built-in Apps (Required)
    'django.contrib.admin',      # <-- This was missing or misspelled
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-Party Apps
    'rest_framework',
    'corsheaders',

    # Local Apps (You created these earlier)
    'accounts',
    'banking',
    'users',
]

# backend/banking_project/settings.py

MIDDLEWARE = [
    # Required by Django and Admin
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware', # <-- E410
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware', # <-- E408
    'django.contrib.messages.middleware.MessageMiddleware', # <-- E409
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Third-party (Must be near the top, usually after SecurityMiddleware)
    'corsheaders.middleware.CorsMiddleware', # Added for your DRF setup
]

# backend/banking_project/settings.py

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates', # <-- Fixes E403
        'DIRS': [],
        'APP_DIRS': True, # Crucial: tells Django to look for 'templates' folders inside apps
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# backend/banking_project/settings.py

# --- Static files (CSS, JavaScript, Images) ---
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# Required setting that defines the base URL for static files.
STATIC_URL = 'static/'

# Optional: Directory where static files will be collected for deployment (e.g., in production)
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Where unauthenticated users are redirected
LOGIN_URL = '/users/login/'        # matches your users/urls.py login path
LOGIN_REDIRECT_URL = '/'           # after login, go to home
LOGOUT_REDIRECT_URL = '/users/login/'  # optional: after logout, go to login

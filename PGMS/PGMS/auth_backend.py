from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from properties.models import OwnerProfile

class MobileOrEmailBackend(ModelBackend):
    """
    Custom authentication backend that allows PG owners to log in using 
    EITHER their registered mobile number OR their email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None

        user = None

        # 1. Try treating the input as a Mobile Number
        try:
            profile = OwnerProfile.objects.get(mobile_number=username)
            user = profile.user
        except OwnerProfile.DoesNotExist:
            pass

        # 2. Try treating the input as an Email Address (if mobile lookup failed)
        if not user:
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                pass

        # 3. Fallback: Check standard Django username
        if not user:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                pass

        # 4. Centralized Safety Check: Verify password and check if account is active
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
            
        return None
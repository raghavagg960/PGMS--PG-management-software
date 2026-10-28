from rest_framework.permissions import BasePermission

class IsOwnerOrWarden(BasePermission):
    """
    Grants access only to Owners and Wardens.
    Cooks, Cleaners, Security, and other operational staff receive a 403 Forbidden.
    """
    message = "Access restricted. Only Owners and Wardens are permitted to access this module."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # If user has no staff_profile, they are an Owner -> ALLOW
        staff_profile = getattr(user, 'staff_profile', None)
        if not staff_profile:
            return True

        # If they are staff, allow ONLY if their role is 'warden'
        return staff_profile.role == 'warden'
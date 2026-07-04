from django.contrib import admin
from .models import PGProperty, OwnerProfile

# We can display the profile information directly alongside our User records, 
# or register it as its own separate dashboard table like this:
admin.site.register(OwnerProfile)
admin.site.register(PGProperty)
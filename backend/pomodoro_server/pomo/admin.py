from django.contrib import admin

from .models import AsanaApiKey, PomoRecords, Tasks

# Register your models here.
admin.site.register(Tasks)
admin.site.register(AsanaApiKey)
admin.site.register(PomoRecords)

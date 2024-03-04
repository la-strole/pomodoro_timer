from django.contrib import admin

from .models import AsanaApiKey, PomoRecords, TaskRecords, Tasks


class AsanaApiKeyAdmin(admin.ModelAdmin):
    list_display = ("user", "api_key")

    def has_add_permission(self, request):
        # Disable the 'Add' button in the admin interface
        return False


class PomodoroRecordsAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "is_full_pomo", "pomo_in_row_count")
    list_filter = ("date", "user")


class TaskRecordsAdmin(admin.ModelAdmin):
    list_display = ("user", "task", "date", "time_spent")
    list_filter = ("date", "user")


class TasksAdmin(admin.ModelAdmin):
    list_display = ("gid", "name", "user", "completed")
    list_filter = ("user", "completed")


# Register your models here.
admin.site.register(Tasks, TasksAdmin)
admin.site.register(AsanaApiKey, AsanaApiKeyAdmin)
admin.site.register(PomoRecords, PomodoroRecordsAdmin)
admin.site.register(TaskRecords, TaskRecordsAdmin)

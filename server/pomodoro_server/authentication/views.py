from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render


# Create your views here.
def signin_view(request) -> HttpResponse:
    """
    Returns a view for signin page.
    """

    if request.method == "GET":
        return render(request=request, template_name="registration/signin.html")

    elif request.method == "POST":
        # Get username and password from form
        form = UserCreationForm(request.POST)

        if form.is_valid():
            user = form.save()
            login(request=request, user=user)
            return HttpResponse(
                content=(f'<h1> successfully add username="{user.username}"</h1>')
            )

        return render(
            request=request, template_name="signin.html", context={"form": form}
        )

    else:
        return HttpResponseBadRequest(content="Request is invalid")

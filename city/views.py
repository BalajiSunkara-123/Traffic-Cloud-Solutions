from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
# Create your views here.

@login_required
def dashboard(request):
    return render(request,'dashboard.html')
    # return render(request,'traffic_dynamic.html')

@login_required
def trafficpolice(request):
    if not request.session.get('is_traffic'):
        return HttpResponse("Unauthorized Access", status=403)

    return render(request, 'traffic_police_dashboard.html')


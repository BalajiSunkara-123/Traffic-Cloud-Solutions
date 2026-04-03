from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required
def dashboard(request):
    return render(request,'dashboard.html')
    # return render(request,'traffic_dynamic.html')

def trafficpolice(request):
    return render(request,'traffic_police_dashboard.html')
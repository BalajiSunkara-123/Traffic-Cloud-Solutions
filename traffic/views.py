from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

# def home(request):
#     return HttpResponse("Traffic Cloud Solutions is running 🚦")

def home(request):
    return render(request,'index.html')

def login(request):
    return render(request,'login.html')
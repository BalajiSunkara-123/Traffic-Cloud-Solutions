from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
# from .models import Phonenumber
# Create your views here.
from django.http import HttpResponse
from django.contrib.auth import authenticate, login


# def home(request):
#     return HttpResponse("Traffic Cloud Solutions is running 🚦")

def home(request):
    return render(request,'index.html')
    
# # if method==post
#     take username password email
def user_login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        
        print(username)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("city/dashboard")   # make sure this URL name exists
        else:
            messages.error(request, "Invalid Username or Password")
            return render(request, "login.html")
    else :
        return render(request, "login.html")

# def login(request):
#     return render(request,'login.html')

def register(request):
    if(request.method=="POST"):
        # print(request.POST.get('username'))
        username = request.POST.get('username')
        fullname=request.POST.get('fullname')
        email=request.POST.get('email')
        password=request.POST.get('password')
        phonenumber=request.POST.get('phonenumber')

        if(User.objects.filter(username=username).exists()):
            messages.error(request, "Username already exists, Try Another One!!")
            return render(request,'register.html')
        
        if(User.objects.filter(email=email).exists()):
            messages.error(request, "User already exists, Kindly Login!!")
            return render(request,'register.html')
        
       
        newUser= User.objects.create_user(username=username,first_name=fullname,email=email,password=password)
        # messages.error("Something went wrong !!")
        # phone=Phonenumber.objects.create(phone_number=phonenumber)
        # print(username)
        return redirect('login')
    else:
        return render(request,'register.html')
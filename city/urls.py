from django.urls import path
from . import views

urlpatterns=[
    path('dashboard',views.dashboard,name='dashboard'),
    path('trafficpolice',views.trafficpolice,name='trafficpolice')
]
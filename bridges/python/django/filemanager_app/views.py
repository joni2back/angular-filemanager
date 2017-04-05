from django.shortcuts import render
from django.shortcuts import render_to_response
import json
from django.http import HttpResponse
import shutil
import os
from filemanager import FileManager

fm = FileManager('/home', False)


def index(request):
    return render(request, 'index.html')


def list_(request):
    return HttpResponse(json.dumps(fm.list(json.loads(request.body.decode('utf-8')))))


def rename(request):
    return HttpResponse(json.dumps(fm.rename(json.loads(request.body.decode('utf-8')))))


def copy(request):
    return HttpResponse(json.dumps(fm.copy(json.loads(request.body.decode('utf-8')))))


def remove(request):
    return HttpResponse(json.dumps(fm.remove(json.loads(request.body.decode('utf-8')))))


def edit(request):
    return HttpResponse(json.dumps(fm.edit(json.loads(request.body.decode('utf-8')))))


def createFolder(request):
    return HttpResponse(json.dumps(fm.createFolder(json.loads(request.body.decode('utf-8')))))


def changePermissions(request):
    return HttpResponse(json.dumps(fm.changePermissions(json.loads(request.body.decode('utf-8')))))


def compress(request):
    return HttpResponse(json.dumps(fm.compress(json.loads(request.body.decode('utf-8')))))


def downloadMultiple(request):
    ret = fm.downloadMultiple(request.GET, HttpResponse)
    os.umask(ret[1])
    shutil.rmtree(ret[2], ignore_errors=True)
    return ret[0]


def move(request):
    return HttpResponse(json.dumps(fm.move(json.loads(request.body.decode('utf-8')))))


def getContent(request):
    return HttpResponse(json.dumps(fm.getContent(json.loads(request.body.decode('utf-8')))))


def extract(request):
    return HttpResponse(json.dumps(fm.extract(json.loads(request.body.decode('utf-8')))))


def download(request):
    return fm.download(request.GET['path'], HttpResponse)


def upload(request):
    return HttpResponse(json.dumps(fm.upload(request.FILES, request.POST['destination'])))

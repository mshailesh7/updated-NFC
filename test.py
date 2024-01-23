import cv2
from scipy.spatial import distance as dist
import numpy as np
from tkinter import *
from PIL import Image,ImageTk
import cv2   
from scipy.spatial import distance as dist
import time
import json
import base64

### capture an image
def picbutton():
    image = Image.fromarray (opencv_image)
    image.save ("images/refrence_frame.png")
    vid.release()
    root.destroy()


vid = cv2.VideoCapture(1) 
vid.set(cv2.CAP_PROP_FRAME_WIDTH, 700) 
vid.set(cv2.CAP_PROP_FRAME_HEIGHT, 300) 
  
root = Tk() 
root.configure(bg="black")
Label(root, text="capture the picture", font=("times new roman", 25, "bold"),bg="black", fg="red"). pack()

label_widget = Label(root) 
label_widget.pack() 

Button(root, text="capture", font=("times new roman", 20, "bold"), bg="black", fg="red", command=picbutton). pack()


while (vid.isOpened()): 
    _, frame = vid.read() 
    opencv_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA) 
  
    captured_image = Image.fromarray(opencv_image) 
    photo_image = ImageTk.PhotoImage(image=captured_image) 
    label_widget.photo_image = photo_image 
    label_widget.configure(image=photo_image) 
    root.update()


##### processing height and other stuff

refmeasure=15
img = cv2.imread('images/refrence_frame.png', 1)
img1=img.copy()
points=[]
i=0
data=[]
pixelsMeasure=None

def click_event(event, x, y, flags, params):
    global points,i
    
    if (event == cv2.EVENT_LBUTTONDOWN):
        points.append((x,y))   
        # print(points) 
        cv2.drawMarker(img1, points[i], (0, 255, 255),cv2.MARKER_CROSS, 25, 3)
        if ((i%2)!=0):
            cv2.line(img1,(x,y),points[i-1],(0,0,0),2)
        i=i+1
    elif event==cv2.EVENT_RBUTTONDOWN:
        points.clear()
        i=0
img_counter=0
while True:
    cv2.imshow('image', img1)
    cv2.setMouseCallback('image', click_event)
    l=len(points)
    
    if (l==6):
        for p in range(0,l,2):
            leng = dist.euclidean(points[p], points[p+1])
            if pixelsMeasure is None:
                pixelsMeasure = leng / refmeasure
            
            actdist=leng/pixelsMeasure
            
            data.append(actdist)
            
            cv2.putText(img1,"{:.1f}in".format(actdist),points[p],cv2.FONT_HERSHEY_SIMPLEX,
            1.65, (90, 0, 250), 3)
            
        _, encoded_image = cv2.imencode('.jpg', img1)
        image = base64.b64encode(encoded_image).decode('utf-8')   
        
        output_data = {
        'status': 'success',
        'message': 'List generated successfully',
        'result_list': data,
        #'result_img':image
        }
        #output_json = json.dumps(output_data)
        print(output_data)
        break
    elif (l==0):
        img1=img.copy()
    elif (l>6):
        break
    
    k=cv2.waitKey(10)
    if (k==ord('q')):
        break
    

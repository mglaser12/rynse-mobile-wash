
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, RefreshCw, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VehicleWashPhotoCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (photoUrl: string) => void;
}

export const VehicleWashPhotoCapture = ({
  open,
  onOpenChange,
  onSave
}: VehicleWashPhotoCaptureProps) => {
  const [activeTab, setActiveTab] = useState<string>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera when dialog opens
  useEffect(() => {
    if (open && activeTab === "camera") {
      startCamera();
    } else if (!open) {
      stopCamera();
      setCapturedImage(null);
      setUploadedImage(null);
    }
    
    return () => {
      stopCamera();
    };
  }, [open, activeTab]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSave = () => {
    if (activeTab === "camera" && capturedImage) {
      onSave(capturedImage);
    } else if (activeTab === "upload" && uploadedImage) {
      onSave(uploadedImage);
    }
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        stopCamera();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vehicle Photo</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <div className="relative bg-black rounded-md overflow-hidden">
              {!capturedImage ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-64 object-cover" 
                  />
                  <Button 
                    variant="secondary" 
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    onClick={handleCapture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                </>
              ) : (
                <>
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-64 object-cover" 
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 left-4"
                    onClick={handleRetake}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                </>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <Button 
              className="w-full" 
              disabled={!capturedImage} 
              onClick={handleSave}
            >
              Save Photo
            </Button>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer h-64 flex flex-col items-center justify-center"
              onClick={triggerFileUpload}
            >
              {uploadedImage ? (
                <div className="relative w-full h-full">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="w-full h-full object-contain" 
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 left-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload a photo</p>
                </>
              )}
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            
            <Button 
              className="w-full" 
              disabled={!uploadedImage} 
              onClick={handleSave}
            >
              Save Photo
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

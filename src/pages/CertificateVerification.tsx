import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PendingCertificate {
  id: string;
  student_name: string;
  course_title: string;
  proof_url: string;
  issued_at: string;
  user_id: string;
}

const CertificateVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [pendingCertificates, setPendingCertificates] = useState<PendingCertificate[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    externalCourseTitle: '',
    proofFile: null as File | null,
  });

  const verifyCertificate = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a verification code.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(
        `https://knglvzdhexfagdflyeqk.supabase.co/functions/v1/verify-certificate/${verificationCode.trim()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      setVerificationResult(result);

      if (result.valid) {
        toast({
          title: "Certificate Verified!",
          description: `Valid certificate for ${result.student_name}`,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Certificate not found or invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast({
        title: "Error",
        description: "Failed to verify certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleUploadProof = async () => {
    if (!user || !uploadData.proofFile || !uploadData.externalCourseTitle) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload file to Supabase Storage
      const fileExt = uploadData.proofFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, uploadData.proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      // Create certificate record with proof
      const { error: insertError } = await supabase
        .from('certificates')
        .insert([{
          user_id: user.id,
          course_id: null as any,
          student_name: 'Pending Verification',
          course_title: uploadData.externalCourseTitle,
          proof_url: publicUrl,
          verified: false,
          score: 0,
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Proof uploaded. Awaiting admin verification.",
      });

      setShowUploadDialog(false);
      setUploadData({ externalCourseTitle: '', proofFile: null });
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: "Error",
        description: "Failed to upload proof. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Certificate Verification
        </h1>
        <p className="text-white/90">
          Verify the authenticity of AimWell certificates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Section */}
        <Card>
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
            <CardDescription>
              Enter a certificate verification code to validate its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={verifyCertificate} disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>

            {verificationResult && (
              <div className={`p-4 rounded-lg border ${
                verificationResult.valid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {verificationResult.valid ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Certificate Verified!</span>
                    </div>
                    <div className="text-sm text-green-600">
                      <p><strong>Student:</strong> {verificationResult.student_name}</p>
                      <p><strong>Course:</strong> {verificationResult.course}</p>
                      <p><strong>Score:</strong> {verificationResult.score}%</p>
                      <p><strong>Issued:</strong> {verificationResult.issued_at}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      {verificationResult.message || 'Verification Failed'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Proof Section */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Submit External Course Proof</CardTitle>
              <CardDescription>
                Upload your Udemy completion certificate for AimWell verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowUploadDialog(true)} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Completion Proof
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Certificate Verification Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge className="bg-primary">Step 1</Badge>
              <h3 className="font-semibold">Complete Course</h3>
              <p className="text-sm text-muted-foreground">
                Finish an internal course with 60%+ score or complete an external Udemy course
              </p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-primary">Step 2</Badge>
              <h3 className="font-semibold">Get Certificate</h3>
              <p className="text-sm text-muted-foreground">
                Receive certificate automatically (internal) or upload proof (external)
              </p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-primary">Step 3</Badge>
              <h3 className="font-semibold">Share & Verify</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique code for employers to verify authenticity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Course Completion Proof</DialogTitle>
            <DialogDescription>
              Upload your Udemy completion certificate or screenshot for verification
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input
                value={uploadData.externalCourseTitle}
                onChange={(e) => setUploadData({ ...uploadData, externalCourseTitle: e.target.value })}
                placeholder="Enter the Udemy course title"
              />
            </div>

            <div className="space-y-2">
              <Label>Completion Proof (PDF or Image)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setUploadData({ ...uploadData, proofFile: file });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Max size: 5MB. Accepted formats: PDF, JPG, PNG
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadProof}>
              <Upload className="h-4 w-4 mr-2" />
              Submit for Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificateVerification;

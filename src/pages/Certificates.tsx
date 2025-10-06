import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Award, Download, ExternalLink, Search, CheckCircle, Calendar, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface Certificate {
  id: string;
  unique_code: string;
  certificate_url: string | null;
  issued_at: string;
  verified: boolean;
  student_name: string;
  course_title: string;
  score: number;
}

interface VerificationResult {
  valid: boolean;
  student_name?: string;
  course?: string;
  issued_at?: string;
  score?: number;
  certificate_url?: string | null;
  message?: string;
}

const Certificates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: "Error",
        description: "Failed to load certificates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCertificatePDF = async (certificateId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { certificateId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: "Certificate PDF generated successfully!",
        });
        fetchCertificates(); // Refresh to get updated URL
      } else {
        throw new Error(data.error || 'Failed to generate certificate PDF');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: "Failed to generate certificate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      // Call the public verification endpoint
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
      setVerificationResult({
        valid: false,
        message: "An error occurred during verification."
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Award className="h-8 w-8" />
          My Certificates
        </h1>
        <p className="text-white/90">
          View and download your earned certificates. Verify any certificate with its unique code.
        </p>
      </div>

      {/* Certificate Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Certificate Verification
          </CardTitle>
          <CardDescription>
            Enter a certificate verification code to validate its authenticity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter verification code (e.g., 12345678-abcd-efgh-ijkl-123456789012)"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={verifyCertificate}
              disabled={verifying}
            >
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
                    {verificationResult.certificate_url && (
                      <p>
                        <strong>Certificate:</strong>{' '}
                        <a 
                          href={verificationResult.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View PDF
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700">
                  <span className="font-semibold">Verification Failed</span>
                  <span className="text-sm text-red-600">
                    {verificationResult.message}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* My Certificates Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Certificates</h2>
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete courses with a score of 60% or higher to earn certificates.
              </p>
              <Button asChild>
                <a href="/education">Browse Courses</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        {certificate.course_title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Earned by {certificate.student_name}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {certificate.score}% Score
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Issued: {new Date(certificate.issued_at).toLocaleDateString()}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Verification Code:</span>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                        {certificate.unique_code}
                      </div>
                    </div>

                    {certificate.verified && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Verified Certificate
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {certificate.certificate_url ? (
                      <Button 
                        size="sm" 
                        asChild
                        className="flex-1"
                      >
                        <a 
                          href={certificate.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => generateCertificatePDF(certificate.id)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setVerificationCode(certificate.unique_code);
                        verifyCertificate();
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
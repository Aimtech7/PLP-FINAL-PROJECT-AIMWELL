import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader as Loader2, Upload, Video, FileText, Image as ImageIcon, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

const AISummary = () => {
  const { toast } = useToast();
  const [textInput, setTextInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [researchQuery, setResearchQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSummarize = async (type: 'text' | 'video' | 'image' | 'research') => {
    setIsLoading(true);
    setSummary('');

    try {
      let content = '';
      if (type === 'text') content = textInput;
      else if (type === 'video') content = videoUrl;
      else if (type === 'image') content = imagePreview || '';
      else if (type === 'research') content = researchQuery;

      if (!content) {
        toast({
          title: "Error",
          description: "Please provide content to process",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-summarize', {
        body: { content, type },
      });

      if (error) throw error;

      if (data.success) {
        setSummary(data.summary);
        toast({
          title: "Success",
          description: "Summary generated successfully",
        });
      } else {
        throw new Error(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearContent = () => {
    setTextInput('');
    setVideoUrl('');
    setImagePreview(null);
    setResearchQuery('');
    setSummary('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Summary & Research</h1>
        <p className="text-muted-foreground mt-2">
          Upload text, images, videos, or perform AI-powered research to get intelligent summaries and insights
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="research" className="gap-2">
            <Search className="h-4 w-4" />
            Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Text Summarization</CardTitle>
              <CardDescription>Paste any text content for an AI-powered summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your text here... (articles, documents, notes, etc.)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[300px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSummarize('text')}
                  disabled={isLoading || !textInput}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    'Summarize Text'
                  )}
                </Button>
                <Button variant="outline" onClick={clearContent}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Analysis</CardTitle>
              <CardDescription>Upload an image for AI description and summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-[400px] mx-auto rounded-lg" />
                    <p className="text-sm text-muted-foreground">Click to upload a different image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSummarize('image')}
                  disabled={isLoading || !imagePreview}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    'Analyze Image'
                  )}
                </Button>
                <Button variant="outline" onClick={clearContent}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Summary</CardTitle>
              <CardDescription>Provide a YouTube or video URL for AI-powered summarization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                type="url"
              />
              {videoUrl && videoUrl.includes('youtube.com') && (
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${new URL(videoUrl).searchParams.get('v')}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSummarize('video')}
                  disabled={isLoading || !videoUrl}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    'Summarize Video'
                  )}
                </Button>
                <Button variant="outline" onClick={clearContent}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Research Assistant</CardTitle>
              <CardDescription>Ask any question or topic for comprehensive AI research and analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your research query... (e.g., 'Effects of intermittent fasting on metabolic health', 'Best practices for stress management', etc.)"
                value={researchQuery}
                onChange={(e) => setResearchQuery(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSummarize('research')}
                  disabled={isLoading || !researchQuery}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    'Research Topic'
                  )}
                </Button>
                <Button variant="outline" onClick={clearContent}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>AI Summary & Analysis</CardTitle>
            <CardDescription>Generated by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISummary;

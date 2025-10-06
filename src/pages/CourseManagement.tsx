import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ExternalLink, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  duration_hours: number;
  is_premium: boolean;
  price: number;
  category: string;
  thumbnail_url?: string;
}

interface ExternalCourse {
  id: string;
  title: string;
  description: string;
  url: string;
  price_text: string;
  instructor_name: string;
  thumbnail_url?: string;
  source: string;
  notes?: string;
  affiliate_tag?: string;
}

const CourseManagement = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [externalCourses, setExternalCourses] = useState<ExternalCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'internal' | 'external'>('internal');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    duration_hours: 0,
    price: 0,
    category: '',
    thumbnail_url: '',
    url: '',
    price_text: '',
    notes: '',
    affiliate_tag: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    try {
      const [coursesRes, externalRes] = await Promise.all([
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('external_courses').select('*').order('created_at', { ascending: false }),
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (externalRes.error) throw externalRes.error;

      setCourses(coursesRes.data || []);
      setExternalCourses(externalRes.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type: 'internal' | 'external', course?: Course | ExternalCourse) => {
    setDialogType(type);
    if (course) {
      setEditingId(course.id);
      setFormData({
        title: course.title || '',
        description: course.description || '',
        instructor_name: course.instructor_name || '',
        duration_hours: 'duration_hours' in course ? course.duration_hours : 0,
        price: 'price' in course ? course.price : 0,
        category: 'category' in course ? course.category : '',
        thumbnail_url: course.thumbnail_url || '',
        url: 'url' in course ? course.url : '',
        price_text: 'price_text' in course ? course.price_text : '',
        notes: 'notes' in course ? course.notes || '' : '',
        affiliate_tag: 'affiliate_tag' in course ? course.affiliate_tag || '' : '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        instructor_name: '',
        duration_hours: 0,
        price: 0,
        category: '',
        thumbnail_url: '',
        url: '',
        price_text: '',
        notes: '',
        affiliate_tag: '',
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (dialogType === 'internal') {
        const courseData = {
          title: formData.title,
          description: formData.description,
          instructor_name: formData.instructor_name,
          duration_hours: formData.duration_hours,
          price: formData.price,
          category: formData.category,
          thumbnail_url: formData.thumbnail_url,
          is_premium: formData.price > 0,
        };

        if (editingId) {
          const { error } = await supabase
            .from('courses')
            .update(courseData)
            .eq('id', editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('courses').insert([courseData]);
          if (error) throw error;
        }
      } else {
        const externalData = {
          title: formData.title,
          description: formData.description,
          url: formData.url,
          price_text: formData.price_text,
          instructor_name: formData.instructor_name,
          thumbnail_url: formData.thumbnail_url,
          notes: formData.notes,
          affiliate_tag: formData.affiliate_tag,
          source: 'udemy',
        };

        if (editingId) {
          const { error } = await supabase
            .from('external_courses')
            .update(externalData)
            .eq('id', editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('external_courses').insert([externalData]);
          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: `Course ${editingId ? 'updated' : 'created'} successfully!`,
      });
      
      setShowDialog(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: 'internal' | 'external') => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const table = type === 'internal' ? 'courses' : 'external_courses';
      const { error } = await supabase.from(table).delete().eq('id', id);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully!",
      });
      
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Course Management</h1>
        <p className="text-primary-foreground/90">
          Manage internal courses and external Udemy links
        </p>
      </div>

      <Tabs defaultValue="internal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="internal">Internal Courses</TabsTrigger>
          <TabsTrigger value="external">External Courses (Udemy)</TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="space-y-4">
          <Button onClick={() => handleOpenDialog('internal')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Internal Course
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Instructor: {course.instructor_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Price: KES {course.price}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenDialog('internal', course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(course.id, 'internal')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <Button onClick={() => handleOpenDialog('external')}>
            <Plus className="h-4 w-4 mr-2" />
            Add External Course
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {course.title}
                    <ExternalLink className="h-4 w-4" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Instructor: {course.instructor_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Price: {course.price_text}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenDialog('external', course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(course.id, 'external')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit' : 'Add'} {dialogType === 'internal' ? 'Internal' : 'External'} Course
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'internal' 
                ? 'Create a course hosted on AimWell platform'
                : 'Add a Udemy course link with optional affiliate tracking'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Course title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Instructor Name</Label>
              <Input
                value={formData.instructor_name}
                onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                placeholder="Instructor name"
              />
            </div>

            {dialogType === 'internal' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <Input
                      type="number"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (KES)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Udemy URL</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://www.udemy.com/course/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price Text</Label>
                  <Input
                    value={formData.price_text}
                    onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
                    placeholder="e.g., Paid - $84.99 or Free"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Affiliate Tag (optional)</Label>
                  <Input
                    value={formData.affiliate_tag}
                    onChange={(e) => setFormData({ ...formData, affiliate_tag: e.target.value })}
                    placeholder="Your Udemy affiliate tag"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this course"
                    rows={2}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Update' : 'Create'} Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, UserPlus, UserMinus, Send, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: 'post' | 'blog';
  image_url?: string;
  tags?: string[];
  created_at: string;
  profiles?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

interface UserProfile {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [postType, setPostType] = useState<'post' | 'blog'>('post');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchUsers();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (full_name, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes and comments counts
      const postsWithStats = await Promise.all(
        (data || []).map(async (post) => {
          const [likesRes, commentsRes, userLikeRes] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_likes').select('id').eq('post_id', post.id).eq('user_id', user!.id).single()
          ]);

          return {
            ...post,
            post_type: post.post_type as 'post' | 'blog',
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            is_liked: !!userLikeRes.data
          };
        })
      );

      setPosts(postsWithStats as Post[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name')
        .neq('id', user!.id);

      if (error) throw error;

      // Get follower counts
      const usersWithStats = await Promise.all(
        (data || []).map(async (profile) => {
          const [followersRes, followingRes, isFollowingRes] = await Promise.all([
            supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', profile.id),
            supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', profile.id),
            supabase.from('follows').select('id').eq('follower_id', user!.id).eq('following_id', profile.id).single()
          ]);

          return {
            ...profile,
            followers_count: followersRes.count || 0,
            following_count: followingRes.count || 0,
            is_following: !!isFollowingRes.data
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const tags = newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase.from('community_posts').insert({
        user_id: user!.id,
        title: newPostTitle,
        content: newPostContent,
        post_type: postType,
        tags: tags.length > 0 ? tags : null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${postType === 'blog' ? 'Blog' : 'Post'} created successfully!`
      });

      setNewPostTitle('');
      setNewPostContent('');
      setNewPostTags('');
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user!.id);
      } else {
        await supabase.from('post_likes').insert({
          post_id: postId,
          user_id: user!.id
        });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleFollow = async (userId: string) => {
    try {
      const userProfile = users.find(u => u.id === userId);
      if (!userProfile) return;

      if (userProfile.is_following) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user!.id)
          .eq('following_id', userId);
      } else {
        await supabase.from('follows').insert({
          follower_id: user!.id,
          following_id: userId
        });
      }

      fetchUsers();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const commentsWithProfiles = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, first_name, last_name')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile || undefined
          };
        })
      );

      setComments(commentsWithProfiles as Comment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: selectedPost.id,
        user_id: user!.id,
        content: newComment
      });

      if (error) throw error;

      setNewComment('');
      fetchComments(selectedPost.id);
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const getUserDisplayName = (profile: any) => {
    return profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Anonymous';
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
      <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-primary-foreground/90">
          Connect, share, and engage with the AimWell community
        </p>
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Pencil className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>Share something with the community</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Post Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={postType === 'post' ? 'default' : 'outline'}
                      onClick={() => setPostType('post')}
                    >
                      Quick Post
                    </Button>
                    <Button
                      variant={postType === 'blog' ? 'default' : 'outline'}
                      onClick={() => setPostType('blog')}
                    >
                      Blog Article
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Enter title..."
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={postType === 'blog' ? 10 : 5}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    placeholder="health, wellness, nutrition..."
                  />
                </div>
                <Button onClick={createPost} className="w-full">
                  Publish {postType === 'blog' ? 'Blog' : 'Post'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-4">
            {posts.filter(p => p.post_type === 'post').map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getUserDisplayName(post.profiles).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription>
                          by {getUserDisplayName(post.profiles)} • {new Date(post.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={post.is_liked ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                    {post.likes_count || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPost(post);
                      fetchComments(post.id);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments_count || 0}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blogs" className="space-y-4">
          <div className="space-y-4">
            {posts.filter(p => p.post_type === 'blog').map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getUserDisplayName(post.profiles).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <CardDescription>
                          by {getUserDisplayName(post.profiles)} • {new Date(post.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge>Blog</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap line-clamp-3">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={post.is_liked ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                    {post.likes_count || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPost(post);
                      fetchComments(post.id);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments_count || 0}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((userProfile) => (
              <Card key={userProfile.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {getUserDisplayName(userProfile).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{getUserDisplayName(userProfile)}</CardTitle>
                      <CardDescription>
                        {userProfile.followers_count || 0} followers • {userProfile.following_count || 0} following
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant={userProfile.is_following ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleFollow(userProfile.id)}
                    className="w-full"
                  >
                    {userProfile.is_following ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Comments Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              by {getUserDisplayName(selectedPost?.profiles)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="whitespace-pre-wrap">{selectedPost?.content}</p>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
              
              <div className="flex gap-2 mb-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                />
                <Button onClick={addComment} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getUserDisplayName(comment.profiles).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{getUserDisplayName(comment.profiles)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;

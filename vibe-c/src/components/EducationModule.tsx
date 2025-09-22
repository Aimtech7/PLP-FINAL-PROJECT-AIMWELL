import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Award, Users, Trophy, Play, Clock, 
  Star, Search, Filter, Download, Share,
  Target, Zap, Calendar, MessageCircle
} from 'lucide-react';

export default function EducationModule() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Education Hub</h2>
        <p className="text-gray-600">Learn, grow, and earn certificates in health and technology.</p>
      </div>

      {/* Learning Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-green-600">5</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold text-purple-600">127</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rank</p>
                <p className="text-2xl font-bold text-orange-600">#23</p>
              </div>
              <Trophy className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="community">Study Rooms</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Python for Healthcare</CardTitle>
                    <CardDescription>Learn Python programming for medical applications</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>75% (15/20 lessons)</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">2h remaining</span>
                  </div>
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Mental Health Basics</CardTitle>
                    <CardDescription>Understanding mental wellness and support</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>100% (12/12 lessons)</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Certificate earned</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Nutrition Science</CardTitle>
                    <CardDescription>Evidence-based nutrition and dietary planning</CardDescription>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>45% (9/20 lessons)</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">5h remaining</span>
                  </div>
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">AI in Healthcare</CardTitle>
                    <CardDescription>Machine learning applications in medicine</CardDescription>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>0% (0/25 lessons)</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">12h estimated</span>
                  </div>
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Telemedicine Fundamentals</CardTitle>
                    <CardDescription>Remote healthcare delivery basics</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">New</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="text-sm text-gray-600">(4.8) • 1,234 students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">8 hours • Beginner</span>
                  <Button size="sm">Enroll</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Digital Health Records</CardTitle>
                <CardDescription>Managing electronic health information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(4)}★
                  </div>
                  <span className="text-sm text-gray-600">(4.6) • 892 students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">6 hours • Intermediate</span>
                  <Button size="sm">Enroll</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Wellness Coaching</CardTitle>
                    <CardDescription>Holistic health and lifestyle guidance</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Popular</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="text-sm text-gray-600">(4.9) • 2,156 students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">10 hours • All levels</span>
                  <Button size="sm">Enroll</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-600" />
                  Mental Health Basics
                </CardTitle>
                <CardDescription>Completed on November 15, 2024</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Certificate ID: MHB-2024-001234</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Basic First Aid
                </CardTitle>
                <CardDescription>Completed on October 28, 2024</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Certificate ID: BFA-2024-001189</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Active Study Rooms
                </CardTitle>
                <CardDescription>Join live study sessions with other learners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Python Study Group</p>
                      <p className="text-sm text-gray-600">12 participants • Live now</p>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Mental Health Discussion</p>
                      <p className="text-sm text-gray-600">8 participants • Live now</p>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Discussion Forums
                </CardTitle>
                <CardDescription>Connect with the learning community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">How to prepare for healthcare certification?</p>
                    <p className="text-xs text-gray-600 mt-1">23 replies • Last activity 2h ago</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Best practices for telemedicine consultations</p>
                    <p className="text-xs text-gray-600 mt-1">15 replies • Last activity 4h ago</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View All Forums
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Daily Challenges
                </CardTitle>
                <CardDescription>Complete daily tasks to earn points and badges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Complete 1 lesson</p>
                        <p className="text-xs text-gray-600">+10 points</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Join a study room</p>
                        <p className="text-xs text-gray-600">+15 points</p>
                      </div>
                    </div>
                    <Button size="sm">Start</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Leaderboard
                </CardTitle>
                <CardDescription>See how you rank among other learners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-yellow-600">#1</span>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">AM</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Alex Martinez</span>
                    </div>
                    <span className="text-sm text-gray-600">2,847 pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-600">#2</span>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">SJ</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Sarah Johnson</span>
                    </div>
                    <span className="text-sm text-gray-600">2,634 pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-blue-600">#23</span>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">JD</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">You</span>
                    </div>
                    <span className="text-sm text-gray-600">1,456 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
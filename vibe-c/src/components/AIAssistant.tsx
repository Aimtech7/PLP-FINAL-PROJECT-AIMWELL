import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, MessageCircle, Send, Mic, Volume2, 
  Heart, BookOpen, Lightbulb, Zap, Clock,
  User, Bot, Sparkles, Settings
} from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI health and learning assistant powered by OpenAI. How can I help you today?",
      timestamp: new Date(Date.now() - 5 * 60000)
    },
    {
      id: 2,
      type: 'user',
      content: "I've been feeling stressed lately and having trouble focusing on my studies.",
      timestamp: new Date(Date.now() - 3 * 60000)
    },
    {
      id: 3,
      type: 'bot',
      content: "I understand you're experiencing stress and focus issues. This is quite common, especially when balancing health and learning goals. Here are some evidence-based strategies that might help:\n\n1. **Mindfulness & Breathing**: Try the 4-7-8 breathing technique\n2. **Study Breaks**: Use the Pomodoro Technique (25min study, 5min break)\n3. **Physical Activity**: Even 10 minutes of walking can reduce stress\n4. **Sleep Hygiene**: Aim for 7-9 hours of quality sleep\n\nWould you like me to guide you through any of these techniques, or would you prefer to discuss what might be causing your stress?",
      timestamp: new Date(Date.now() - 2 * 60000)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'bot' as const,
        content: "Thank you for sharing that with me. Based on what you've told me, I can provide some personalized recommendations. Let me analyze this and get back to you with specific strategies tailored to your situation.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Assistant</h2>
        <p className="text-gray-600">Your intelligent companion for health, learning, and mental wellness support.</p>
      </div>

      {/* AI Features Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Health Support</p>
                <p className="text-lg font-bold text-green-600">24/7</p>
              </div>
              <Heart className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Help</p>
                <p className="text-lg font-bold text-blue-600">Smart</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insights</p>
                <p className="text-lg font-bold text-purple-600">AI</p>
              </div>
              <Lightbulb className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response</p>
                <p className="text-lg font-bold text-orange-600">Instant</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Health & Learning Assistant
              </CardTitle>
              <CardDescription>
                Powered by OpenAI GPT-4 • Mental health support • Study guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                        <Avatar className="w-8 h-8">
                          {message.type === 'user' ? (
                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600">
                              <Bot className="w-4 h-4 text-white" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Bot className="w-4 h-4 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me about health, learning, or mental wellness..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button variant="outline">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Features Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="w-4 h-4 mr-2" />
                Mental Health Check
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Study Plan Help
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Lightbulb className="w-4 h-4 mr-2" />
                Learning Tips
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Time Management
              </Button>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Mental health support & counseling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Personalized study recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Health symptom analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Stress management techniques</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Learning path optimization</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Features</CardTitle>
              <CardDescription>
                Powered by OpenAI TTS & Speech Recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Volume2 className="w-4 h-4 mr-2" />
                Text to Speech
              </Button>
              <Button variant="outline" className="w-full">
                <Mic className="w-4 h-4 mr-2" />
                Voice Input
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                AI Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Style</span>
                  <Badge variant="outline">Friendly</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expertise Level</span>
                  <Badge variant="outline">Beginner</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Mode</span>
                  <Badge className="bg-green-100 text-green-800">Secure</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Customize Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
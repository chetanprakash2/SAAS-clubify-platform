import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users, 
  Send, 
  MessageCircle,
  Volume2,
  VolumeX,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingRoomProps {
  meetingId: string;
  onLeave: () => void;
}

interface MeetingMessage {
  _id: string;
  senderId: string;
  content: string;
  messageType: "text" | "system";
  createdAt: string;
  sender: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  status: "scheduled" | "active" | "ended" | "cancelled";
  participants: string[];
  maxParticipants?: number;
  isVoiceOnly: boolean;
  startedAt?: string;
  endedAt?: string;
}

export function MeetingRoom({ meetingId, onLeave }: MeetingRoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Fetch meeting details
  const { data: meeting, isLoading: meetingLoading } = useQuery<Meeting>({
    queryKey: [`/api/meetings/${meetingId}`],
    refetchInterval: 5000, // Refresh every 5 seconds to get updated participant list
  });

  // Fetch meeting messages
  const { data: messages = [], refetch: refetchMessages } = useQuery<MeetingMessage[]>({
    queryKey: [`/api/meetings/${meetingId}/messages`],
    refetchInterval: 2000, // Refresh messages every 2 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/meetings/${meetingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      refetchMessages();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave meeting mutation
  const leaveMeetingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/meetings/${meetingId}/leave`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to leave meeting");
      }

      return response.json();
    },
    onSuccess: () => {
      cleanupMedia();
      onLeave();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize voice chat
  useEffect(() => {
    if (meeting?.isVoiceOnly) {
      initializeVoiceChat();
    }

    return () => {
      cleanupMedia();
    };
  }, [meeting]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeVoiceChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }, 
        video: false 
      });
      
      mediaStreamRef.current = stream;
      setIsConnected(true);
      
      // Create audio context for better audio processing
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Store audio context for cleanup
      (mediaStreamRef.current as any).audioContext = audioContext;
      
      toast({
        title: "Voice Chat Connected",
        description: "Microphone is active and ready",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to join voice chat. Refresh and try again.",
        variant: "destructive",
      });
    }
  };

  const cleanupMedia = () => {
    if (mediaStreamRef.current) {
      // Stop all tracks
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      
      // Clean up audio context
      const audioContext = (mediaStreamRef.current as any).audioContext;
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      
      mediaStreamRef.current = null;
    }
    setIsConnected(false);
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!audioTracks[0]?.enabled);
      
      toast({
        title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
        description: isMuted ? "You can now speak" : "Your microphone is muted",
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleLeaveMeeting = () => {
    leaveMeetingMutation.mutate();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getUserDisplayName = (sender: MeetingMessage['sender']) => {
    if (sender.firstName || sender.lastName) {
      return `${sender.firstName || ''} ${sender.lastName || ''}`.trim();
    }
    return sender.email?.split('@')[0] || 'Unknown User';
  };

  if (meetingLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Meeting not found</p>
        <Button onClick={onLeave} className="mt-4">
          Back to Meetings
        </Button>
      </div>
    );
  }

  if (meeting.status !== 'active') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          This meeting is {meeting.status}
        </p>
        <Button onClick={onLeave}>
          Back to Meetings
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Meeting Info & Controls */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {meeting.title}
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Connected" : "Connecting..."}
                  </Badge>
                </CardTitle>
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {meeting.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {meeting.participants.length}
                {meeting.maxParticipants && ` / ${meeting.maxParticipants}`}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "default"}
                  size="lg"
                  onClick={toggleMute}
                  disabled={!isConnected}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                
                <Button
                  variant={isSpeakerOn ? "default" : "outline"}
                  size="lg"
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  Speaker
                </Button>
              </div>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLeaveMeeting}
                disabled={leaveMeetingMutation.isPending}
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                Leave Meeting
              </Button>
            </div>
            
            {meeting.isVoiceOnly && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🎙️ Voice-only meeting for optimal stability and performance
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Chat Status */}
        {meeting.isVoiceOnly && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className={cn(
                  "w-24 h-24 mx-auto rounded-full flex items-center justify-center",
                  isConnected && !isMuted 
                    ? "bg-green-100 dark:bg-green-900 animate-pulse" 
                    : "bg-gray-100 dark:bg-gray-800"
                )}>
                  {isMuted ? (
                    <MicOff className="w-8 h-8 text-red-500" />
                  ) : (
                    <Mic className="w-8 h-8 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isMuted ? "Microphone Muted" : "Microphone Active"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? "Connected to voice chat" : "Connecting..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Panel */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5" />
            Meeting Chat
          </CardTitle>
        </CardHeader>
        <Separator />
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={cn(
                  "flex flex-col space-y-1",
                  msg.messageType === "system" && "text-center"
                )}
              >
                {msg.messageType === "system" ? (
                  <div className="text-xs text-muted-foreground italic">
                    {msg.content}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {msg.senderId === user?.id ? "You" : getUserDisplayName(msg.sender)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm break-words">{msg.content}</p>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
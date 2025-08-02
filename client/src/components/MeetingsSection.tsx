import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Mic, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Square,
  Eye,
  Trash2
} from "lucide-react";
import { CreateMeetingModal } from "@/components/modals/create-meeting-modal";
import { MeetingRoom } from "@/components/MeetingRoom";
import { queryClient } from "@/lib/queryClient";

interface MeetingSectionProps {
  clubId: string;
  isAdmin: boolean;
}

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  status: "scheduled" | "active" | "ended" | "cancelled";
  participants: string[];
  maxParticipants?: number;
  isVoiceOnly: boolean;
  creator: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string;
}

export function MeetingsSection({ clubId, isAdmin }: MeetingSectionProps) {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // Fetch meetings
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: [`/api/clubs/${clubId}/meetings`],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Start meeting mutation
  const startMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await fetch(`/api/meetings/${meetingId}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start meeting");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clubs/${clubId}/meetings`] });
      toast({
        title: "Success",
        description: "Meeting started successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // End meeting mutation
  const endMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await fetch(`/api/meetings/${meetingId}/end`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to end meeting");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clubs/${clubId}/meetings`] });
      toast({
        title: "Success",
        description: "Meeting ended successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join meeting mutation
  const joinMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await fetch(`/api/meetings/${meetingId}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join meeting");
      }

      return response.json();
    },
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/clubs/${clubId}/meetings`] });
      setSelectedMeetingId(meetingId);
      toast({
        title: "Success",
        description: "Joined meeting successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusBadge = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Live</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getUserDisplayName = (creator: Meeting['creator']) => {
    if (creator.firstName || creator.lastName) {
      return `${creator.firstName || ''} ${creator.lastName || ''}`.trim();
    }
    return creator.email?.split('@')[0] || 'Unknown User';
  };

  // If viewing a specific meeting room
  if (selectedMeetingId) {
    return (
      <MeetingRoom
        meetingId={selectedMeetingId}
        onLeave={() => setSelectedMeetingId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meetings</h1>
          <p className="text-gray-600">Start voice meetings and collaborate with your team in real-time.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first meeting to start collaborating with voice chat and real-time messaging.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {meeting.isVoiceOnly ? (
                        <Mic className="w-6 h-6 text-primary" />
                      ) : (
                        <Video className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.title}
                        </h3>
                        {getStatusBadge(meeting.status)}
                        {meeting.status === 'active' && (
                          <div className="flex items-center text-green-600 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                            Live
                          </div>
                        )}
                      </div>
                      
                      {meeting.description && (
                        <p className="text-gray-600 mb-3">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {meeting.participants.length}
                          {meeting.maxParticipants && ` / ${meeting.maxParticipants}`} participants
                        </span>
                        
                        {meeting.scheduledAt && (
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(meeting.scheduledAt)}
                          </span>
                        )}
                        
                        {meeting.startedAt && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Started at {formatTime(meeting.startedAt)}
                          </span>
                        )}
                        
                        <span>
                          Created by {getUserDisplayName(meeting.creator)}
                        </span>
                        
                        <span className="flex items-center">
                          {meeting.isVoiceOnly ? (
                            <>
                              <Mic className="w-4 h-4 mr-1" />
                              Voice Only
                            </>
                          ) : (
                            <>
                              <Video className="w-4 h-4 mr-1" />
                              Video Call
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {meeting.status === 'scheduled' && isAdmin && (
                      <Button
                        size="sm"
                        onClick={() => startMeetingMutation.mutate(meeting._id)}
                        disabled={startMeetingMutation.isPending}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {meeting.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => joinMeetingMutation.mutate(meeting._id)}
                          disabled={joinMeetingMutation.isPending}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                        
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => endMeetingMutation.mutate(meeting._id)}
                            disabled={endMeetingMutation.isPending}
                          >
                            <Square className="w-4 h-4 mr-1" />
                            End
                          </Button>
                        )}
                      </>
                    )}
                    
                    {(meeting.status === 'ended' || meeting.status === 'cancelled') && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateMeetingModal
        clubId={clubId}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
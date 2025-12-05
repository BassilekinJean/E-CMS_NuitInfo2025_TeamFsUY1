"""
Messages serializers
"""
from rest_framework import serializers
from .models import Conversation, Message, Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'filename', 'file_type', 'file_size', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.nom', read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'content',
            'is_read', 'is_from_citizen', 'attachments', 'created_at'
        ]


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']


class ConversationListSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.nom', read_only=True)
    citizen_email = serializers.CharField(source='citizen.email', read_only=True)
    last_message_preview = serializers.SerializerMethodField()
    last_message_date = serializers.SerializerMethodField()
    assigned_to_name = serializers.CharField(source='assigned_to.nom', read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'subject', 'status', 'priority', 'category',
            'citizen_name', 'citizen_email',
            'assigned_to', 'assigned_to_name',
            'unread_count', 'last_message_preview', 'last_message_date',
            'created_at', 'updated_at'
        ]
    
    def get_last_message_preview(self, obj):
        last_msg = obj.last_message
        if last_msg:
            return last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content
        return None
    
    def get_last_message_date(self, obj):
        last_msg = obj.last_message
        return last_msg.created_at if last_msg else obj.created_at


class ConversationSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.nom', read_only=True)
    citizen_email = serializers.CharField(source='citizen.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.nom', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'subject', 'status', 'priority', 'category',
            'citizen', 'citizen_name', 'citizen_email',
            'assigned_to', 'assigned_to_name',
            'unread_count', 'messages',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['citizen', 'unread_count']


class ConversationCreateSerializer(serializers.ModelSerializer):
    message = serializers.CharField(write_only=True)
    
    class Meta:
        model = Conversation
        fields = ['subject', 'category', 'priority', 'message']
    
    def create(self, validated_data):
        message_content = validated_data.pop('message')
        conversation = Conversation.objects.create(**validated_data)
        
        # Créer le premier message
        Message.objects.create(
            conversation=conversation,
            sender=validated_data.get('citizen'),
            content=message_content,
            is_from_citizen=True
        )
        
        return conversation

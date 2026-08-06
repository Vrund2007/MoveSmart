"""apps/messages/views.py — DRF views for user messaging and inbox"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
# pyrefly: ignore [missing-import]
from apps.common.responses import api_response
from db import messages_repo
from .serializers import ConversationCreateSerializer, MessageAddSerializer


class ConversationsView(APIView):
    """GET /api/messages/conversations — list user conversations.
    POST /api/messages/conversations — start/get conversation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = messages_repo.get_user_conversations(request.user.id)
        return api_response(data=conversations, message="Conversations retrieved.")

    def post(self, request):
        serializer = ConversationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        recipient_id = serializer.validated_data['recipient_id']
        listing_id = serializer.validated_data.get('listing_id')
        initial_msg = serializer.validated_data.get('initial_message')

        participants = [str(request.user.id), str(recipient_id)]
        conversation = messages_repo.get_or_create_conversation(participants, listing_id)

        if initial_msg and not conversation.get('messages'):
            messages_repo.add_message_to_conversation(conversation['_id'], str(request.user.id), initial_msg)
            conversation = messages_repo.get_conversation_by_id(conversation['_id'], str(request.user.id))

        return api_response(data=conversation, message="Conversation ready.", status_code=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    """GET /api/messages/conversations/:id — fetch single conversation with messages.
    DELETE /api/messages/conversations/:id — delete conversation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        conv = messages_repo.get_conversation_by_id(conversation_id, request.user.id)
        if not conv:
            return api_response(message="Conversation not found.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=conv, message="Conversation details retrieved.")

    def delete(self, request, conversation_id):
        success = messages_repo.delete_conversation(conversation_id, request.user.id)
        if not success:
            return api_response(message="Conversation not found or failed to delete.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(message="Conversation deleted successfully.")


class ConversationMessagesView(APIView):
    """POST /api/messages/conversations/:id/messages — send message in conversation."""
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        serializer = MessageAddSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        text = (serializer.validated_data.get('text') or '').strip()
        media_type = serializer.validated_data.get('media_type') or 'text'
        media_url = serializer.validated_data.get('media_url')

        if not text and not media_url:
            return api_response(message="Message text or media attachment required.", status_code=status.HTTP_400_BAD_REQUEST)

        updated_conv = messages_repo.add_message_to_conversation(
            conversation_id, request.user.id, text, media_type=media_type, media_url=media_url
        )
        if not updated_conv:
            return api_response(message="Conversation not found or failed to send message.", status_code=status.HTTP_400_BAD_REQUEST)

        return api_response(data=updated_conv, message="Message sent successfully.")

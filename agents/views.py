from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Agent
from .serializers import AgentSerializer

class AgentListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agents = Agent.objects.all()
        return Response(AgentSerializer(agents, many=True).data)

    def post(self, request):
        serializer = AgentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AgentToggleStatus(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        agent = Agent.objects.get(pk=pk)
        agent.is_active = not agent.is_active
        agent.save()
        return Response({"status": agent.is_active})

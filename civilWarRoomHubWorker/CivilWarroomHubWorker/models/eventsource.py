from CivilWarroomHubWorker.models.basemodel import BaseModel

class EventSourceModel(BaseModel):
    def _get_schema_name(self):
        return "EventSourceV1"
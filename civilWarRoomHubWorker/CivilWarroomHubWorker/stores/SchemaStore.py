from CivilWarroomHubWorker import Utils
from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.FileStore import FileStoreDriver
import os


class SchemaStore:
    def __init__(self, context: ContextStore) -> None:
        self._schemas_path = os.path.join(
                    os.path.abspath(os.path.dirname(__file__)),
                    "json_schemas"
            )
        
        if 'SCHEMA_FILES' in context.get("config"):
            if context.get("config")['SCHEMA_FILES']:
                self._schemas_path = context.get("config")['SCHEMA_FILES']

        self.driver = FileStoreDriver(self._schemas_path)  

        self._load_schemas()

    def _extract_name_from_file(self, _filename: str):
        return _filename[:-5] # strip .json
    
    def _get_content_object(self, _name):
        return Utils.json_to_obj(self.driver.get_content(_name))
    
    def _load_schemas(self):
        self.schemas = { 
            self._extract_name_from_file(filename): self._get_content_object(filename)
            for filename in self.driver.get_list()
            if(filename.endswith(".json"))
        }
    def getSchemas(self, _name):
        return self.schemas[_name]
    
    def list(self):
        return self.schemas.keys()
    



def getSchemaStoreFromContext(ctx:ContextStore) -> SchemaStore:
    if(not ctx.get(SchemaStore.__name__)):
        ctx.set(SchemaStore.__name__, SchemaStore(ctx))
        
    return ctx.get(SchemaStore.__name__)
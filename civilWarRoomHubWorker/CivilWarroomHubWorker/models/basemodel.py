from jsonschema import validate
#from abc import ABC, abstractmethod

from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.SchemaStore import getSchemaStoreFromContext

class BaseModel():
    def validate(self):
        return validate(self._model,self.get_jsonschema())
    
    def isValid(self) -> bool:
        try:
            self.validate()
            return True
        except Exception:
            return False
        
    def _get_version(self):
        return "V1"
    
    def _get_schema_name(self):
        return str(self.__class__.__name__) +self._get_version()
    
    def get_jsonschema(self):
        """ Validate object base on https://json-schema.org/


        schema_example = {
            "type" : "object",
            "properties" : {
                "price" : {"type" : "number"},
                "name" : {"type" : "string"},
            },
        }

        """

        return getSchemaStoreFromContext(self.context).getSchemas(self._get_schema_name())
        
    def get_root_field_names(self):
        return self.get_jsonschema()["properties"].keys()

    def update(self, obj_to_enrich):
        for valid_key in self.get_root_field_names():
            if valid_key in obj_to_enrich.keys():
                self._model[valid_key] = obj_to_enrich[valid_key]

    def get_model(self):
        return self._model.copy()
    
    def _init_defaults_model(self):
        ret_obj = {}
        root_schema = self.get_jsonschema()["properties"]
        for root_prop_name in root_schema.keys():
            prop_obj = root_schema[root_prop_name]
            if( isinstance(prop_obj,dict)):
                if "default" in prop_obj.keys():
                    ret_obj[root_prop_name] = prop_obj["default"]

        return ret_obj


    def __init__(self, context: ContextStore , model = {}) -> None:
        self.context = context
        self._model = self._init_defaults_model()
        self.update(model)
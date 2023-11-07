from jsonschema import validate
from abc import ABC, abstractmethod

class BaseModel(ABC):
    def validate(self):
        return validate(self.model,self.get_jsonschema())
    
    def isValid(self) -> bool:
        try:
            self.validate()
            return True
        except Exception:
            return False
        
    @abstractmethod
    def get_jsonschema(self):
        """ Validate object base on https://json-schema.org/


        schema_example = {
            "type" : "object",
            "properties" : {
                "price" : {"type" : "number"},
                "name" : {"type" : "string"},
            },
        }

        Raises:
            NotImplementedError: Kind'a reminder for abstract object
        """
        retObj = {}
        if("exists" in retObj):
            return retObj
        
        raise NotImplementedError("Json schema not implemented")
        
    def get_root_field_names(self):
        return self.get_jsonschema()["properties"].keys()

    def update(self, obj_to_enrich):
        for valid_key in self.get_root_field_names():
            if valid_key in obj_to_enrich.keys():
                self.model[valid_key] = obj_to_enrich[valid_key]

    def get_model(self):
        return self.model
    
    def __init__(self, model) -> None:
        self.model = {}
        self.update(model)
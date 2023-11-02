

class ContextStore:
    def __init__(self) -> None:
        self._context = {}
        
    def set(self, name, obj):
        self._context[name] = obj

    def get(self, name):
        return self._context[name]
    
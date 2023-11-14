import os

class FileStoreDriver:
    def get_list(self):
        return [f for f in os.listdir(self._path) if os.path.isfile(os.path.join(self._path, f))]
    
    def get_content(self, _file_name):

        path = os.path.join(self._path, _file_name)
        data = "{}"

        #check if file is present
        if not os.path.isfile(path):
            raise FileNotFoundError(f"Cannot find file {path}")
    
        with open(path, 'r') as file:
            data = file.read()

        return data
    
    def __init__(self, path) -> None:
        self._path = path

        if(not os.path.exists(self._path)):
            raise Exception(f"FileStoreDriver: Path not found {self._path}")
        

        
        
        
import json

def is_json(json_str):
  try:
    json_to_obj(json_str)
  except ValueError as e:
    return False
  return True

def json_to_obj(json_str):
    return json.loads(json_str)

def obj_to_json(inobj):
    return json.dumps(inobj)

def obj_filter(field_list, obj):
   return  {key: obj[key] for key in field_list}

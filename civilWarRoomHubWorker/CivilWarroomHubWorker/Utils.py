import json
from datetime import datetime, timezone
import pprint

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

def get_timestamp_str_now():
   return get_timestmp_str(datetime.now())

def get_timestmp_str(dt: datetime):
   dt_utc = dt.astimezone(timezone.utc)
   return dt_utc.strftime("%Y-%m-%dT%H:%M:%SZ")

def get_datetime_from_timestmp_str(formatted_string):
   return datetime.strptime(formatted_string, '%Y-%m-%dT%H:%M:%SZ')



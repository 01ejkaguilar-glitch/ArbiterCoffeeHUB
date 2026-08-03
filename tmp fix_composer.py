import json
import sys

with open('composer.json', 'r') as f:
    data = json.load(f)

# Move l5-swagger from require-dev to require
if 'require-dev' in data and 'darkaonline/l5-swagger' in data['require-dev']:
    version = data['require-dev'].pop('darkaonline/l5-swagger')
    if 'require' not in data:
        data['require'] = {}
    data['require']['darkaonline/l5-swagger'] = version
    # Remove require-dev if empty
    if not data['require-dev']:
        del data['require-dev']

with open('composer.json', 'w') as f:
    json.dump(data, f, indent=4)
    # Add a newline at the end
    f.write('\n')
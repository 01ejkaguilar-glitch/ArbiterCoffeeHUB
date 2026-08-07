import yaml
import sys

def validate_workflow(file_path):
    try:
        with open(file_path, 'r') as file:
            workflow = yaml.safe_load(file)

        # Check required sections
        required_sections = ['name', 'on', 'jobs']
        for section in required_sections:
            if section not in workflow:
                print(f"Error: Missing required section '{section}'")
                return False

        # Check jobs.deploy exists
        if 'jobs' not in workflow or 'deploy' not in workflow['jobs']:
            print("Error: Missing 'jobs.deploy' section")
            return False

        # Check deploy job has runs-on and steps
        deploy_job = workflow['jobs']['deploy']
        if 'runs-on' not in deploy_job:
            print("Error: Missing 'runs-on' in deploy job")
            return False

        if 'steps' not in deploy_job:
            print("Error: Missing 'steps' in deploy job")
            return False

        print("Workflow validation passed!")
        return True

    except yaml.YAMLError as e:
        print(f"YAML parsing error: {e}")
        return False
    except Exception as e:
        print(f"Error reading file: {e}")
        return False

if __name__ == "__main__":
    file_path = ".github/workflows/deploy.yml"
    if validate_workflow(file_path):
        sys.exit(0)
    else:
        sys.exit(1)
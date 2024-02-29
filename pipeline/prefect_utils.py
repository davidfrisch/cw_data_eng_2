from prefect import runtime

def get_flow_run_id():
    return runtime.flow_run.id

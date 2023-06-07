import os
import io
import boto3
import json
import csv
import pandas as pd
import numpy as np

def np2csv(arr):
    csv = io.BytesIO()
    np.savetxt(csv, arr, delimiter=",", fmt="%g")
    return csv.getvalue().decode().rstrip()
    

runtime = boto3.client('sts')
response = runtime.assume_role(
    RoleArn="arn:aws:iam::278052185692:role/SageMakerExternal",
    RoleSessionName="test",
    ExternalId='278052185692'
)

# grab environment variables
ENDPOINT_NAME = os.environ['ENDPOINT_NAME']
runtime= boto3.client('runtime.sagemaker',
    aws_access_key_id=response["Credentials"]["AccessKeyId"],
    aws_secret_access_key=response["Credentials"]["SecretAccessKey"],
    aws_session_token=response["Credentials"]["SessionToken"],)



def lambda_handler(event, context):
    
    t = np.asarray([event['data'][1:]])
    payload = np2csv(t)
    

    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME, ContentType='text/csv', Body=payload)
    result = json.loads(response['Body'].read().decode())
    
    
    return result

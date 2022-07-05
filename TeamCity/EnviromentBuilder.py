from typing import *
from dotenv import *
from os import *
from json import *

# just copy this script into team-city python with custom script mode. 
# all values begin with % and end with % will detect automatically by teamcity.

# twilio 
twilioConfigs = {
    "TWILIO_ACCOUNT_SID" : "%TWILIO_ACCOUNT_SID%",
 	"TWILIO_API_KEY" : "%TWILIO_API_KEY%",
 	"TWILIO_API_SECRET" : "%TWILIO_API_SECRET%",
 	"TWILIO_SENDER_PHONE_NUMBER" : "%TWILIO_PHONE_NUMBER%"
}

#mongo 
mongoDbConfig = {
    "MONGO_HOST" : "%MONGO_HOST%",
    "MONGO_PORT" : "%MONGO_PORT%",
    "MONGO_USERNAME" : "%MONGO_USERNAME%",
    "MONGO_PASSWORD" : "%MONGO_PASSWORD%",
    "MONGO_DATABASE" : "%MONGO_DB%",
    "MONGO_VOLUME" : "%MONGO_VOLUME_PATH%"
}

# mongo express
mongoExpressConfig = {
    "MONGO_EXPRESS_PORT" : "%MONGO_EXPRESS_PORT%",
    "MONGO_EXPRESS_USERNAME" : "%MONGO_EXPRESS_USERNAME%",
    "MONGO_EXPRESS_PASSWORD" : "%MONGO_EXPRESS_PASSWORD%",
    "MONGO_EXPRESS_PATH" : "%MONGO_EXPRESS_PATH%"
}

# REDIS 
redisConfig = {
    "REDIS_HOST" : "%REDIS_HOST%",
    "REDIS_PORT" : 6379,
    "REDIS_VOLUME" : "%REDIS_VOLUME_PATH%",
    "REDIS_COMMANDER_PORT" : "%REDIS_COMMANDER_PORT%",
}

emailServiceConfig = {
    "EMAIL_SERVICE" : "%EMAIL_SERVICE%",
    "EMAIL_USER" : "%EMAIL_USER%",
    "EMAIL_PASSWORD" : "%MAIL_SERVICE_PASSWORD%"
}

security = {
    "COOKIES_SIGNATURE_SECRET" : "SomeahjluiqweqweqwewCookienmvuilwSecret",
    "JWT_ACCESS_TOKEN_SECRET" : "%JWT_ACCESS_TOKEN_SECRET%",
    "JWT_ACCESS_TOKEN_EXPIRATION_TIME" : %JWT_ACCESS_TOKEN_EXPIRATION_TIME%,
    "JWT_REFRESH_TOKEN_SECRET" : "%JWT_REFRESH_TOKEN_SECRET%",
    "JWT_REFRESH_TOKEN_EXPIRATION_TIME" : %JWT_REFRESH_TOKEN_EXPIRATION_TIME%,
    "JWT_VERIFICATION_TOKEN_SECRET" : "%JWT_VERIFICATION_TOKEN_SECRET%",
    "JWT_VERIFICATION_TOKEN_EXPIRATION_TIME" : %JWT_VERIFICATION_TOKEN_EXPIRATION_TIME%,
    "SMS_VERIFICATION_CODE_EXPIRATION_TIME" : %SMS_VERIFICATION_CODE_EXPIRATION_TIME%,
}

defaultAdminConfig = {
    "ADMIN_EMAIL" : "%PANEL_ADMIN_EMAIL%",
    "ADMIN_PASSWORD" : "%PANEL_ADMIN_PASSWORD%",
    "ADMIN_PHONE" : "%PANEL_ADMIN_NUMBER%"
}

webServerConfig = {
    "IMAGE_NAME" : "%IMAGE_NAME%",
    "IMAGE_TAG" : "%IMAGE_TAG%",
    "FILES_UPLOAD_VOLUME" : "%FILES_UPLOAD_VOLUME%",
    "DOMAIN" : "%DOMAIN%",
    "API_PATH" : "%env.ROUTER_BASE%"
}

appConfig = {
    "PORT" : 3000,
    "FRONTEND_URL" : "%env.API_URL%%",
    "FILE_UPLOAD_PATH" : "%FILE_UPLOAD_PATH%"
}

def createTemplate():
    system("echo Hello from the other side!")
    system("cp .sample.prod.env .prod.env")


def setKeysValues(remoteConfig, envConfig):
    for key in envConfig:
        if key in remoteConfig and remoteConfig[key]:
            set_key(envPath, key, remoteConfig[key], quote_mode=quoteMode)
        else:
            continue

def validate(finalConfigs):
    for key in finalConfigs:
        value = finalConfigs[key]
        
        if type(value) == str and str(value) and len(value) > 0:
            strValue = str(value)
            if strValue.startswith('%') and strValue.endswith('%'):
                raise Exception('The {} is not set please check it out. value: {}'.format(key, strValue))
                
        else:
            continue
            
            

print('preparing')
createTemplate()
quoteMode = "never"
# Get the current working directory
cwd = getcwd()

# Print the current working directory
print("Current working directory: {0}".format(cwd))
envPath = find_dotenv(cwd +'/.prod.env')

if len(envPath) <= 0:
    raise Exception('The `{}` is not found!!! please check it out. value: {}'.format('.prod.env', envPath))

envConfigs = dict(dotenv_values(envPath))

print('chaning values')
setKeysValues(appConfig, envConfigs)
setKeysValues(webServerConfig, envConfigs)
setKeysValues(mongoDbConfig, envConfigs)
setKeysValues(mongoExpressConfig, envConfigs)
setKeysValues(security, envConfigs)
setKeysValues(redisConfig, envConfigs)

setKeysValues(emailServiceConfig, envConfigs)
setKeysValues(defaultAdminConfig, envConfigs)

setKeysValues(twilioConfigs, envConfigs)

print('checking values')
finalResult = dict(dotenv_values(envPath))
validate(finalResult)
print('validation is ok.')
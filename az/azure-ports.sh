#!/bin/bash

# Определение переменных
RESOURCE_GROUP="Pv32"
VM_NAME="Pv32_b2"
LOCATION="northeurope"
ADMIN_USERNAME="keeper"
ADMIN_PASSWORD="QweAsdZxc!23"
VM_SIZE="Standard_B1s" # Выбранный размер 
IMAGE="Ubuntu2204" # Образ операционной системы, например, Ubuntu 22.04 LTS


az vm open-port \
  --resource-group $RESOURCE_GROUP  \
  --name $VM_NAME \
  --port 80
  
az vm open-port \
  --resource-group $RESOURCE_GROUP  \
  --name $VM_NAME \
  --port 443

  az vm open-port \
    --resource-group $RESOURCE_GROUP  \
    --name $VM_NAME \
    --port 3000
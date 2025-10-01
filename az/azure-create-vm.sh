#!/bin/bash

# Определение переменных
RESOURCE_GROUP="Test"
VM_NAME="next-virtual-machine"
LOCATION="francecentral"
ADMIN_USERNAME="absorfy"
ADMIN_PASSWORD="256131.Lagger"
VM_SIZE="Standard_B2s" # Выбранный размер
IMAGE="Ubuntu2204" # Образ операционной системы, например, Ubuntu 22.04 LTS

# Создание виртуальной машины
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --location $LOCATION \
  --image $IMAGE \
  --size $VM_SIZE \
  --admin-username $ADMIN_USERNAME \
  --admin-password $ADMIN_PASSWORD \
  --public-ip-address $VM_NAME-ip \
  --public-ip-address-allocation static \
  --verbose

echo "Виртуальная машина $VM_NAME успешно создана!"
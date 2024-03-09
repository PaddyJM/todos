if aws dynamodb describe-table --table-name TodosTable-dev --endpoint-url http://localhost:8000 > /dev/null
then
  echo "Table already exists"
else
  echo "Creating table"
  AWS_PAGER="" aws dynamodb create-table \
    --table-name TodosTable-dev \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
    --key-schema \
      AttributeName=id,KeyType=HASH \
    --provisioned-throughput \
      ReadCapacityUnits=10,WriteCapacityUnits=10 \
    --endpoint-url http://localhost:8000
fi
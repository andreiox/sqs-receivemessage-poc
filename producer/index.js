const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config();

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const baseURL = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT}/`;

const queueNames = ["doorkeeper1", "doorkeeper2", "doorkeeper3"];

const createQueue = async (queueName) => {
  const params = {
    QueueName: queueName,
  };

  return sqs.createQueue(params).promise();
};

const sendMessage = async (queueName, data) => {
  AWS.config.getCredentials((err) => {
    if (err) throw err;
  });

  const params = {
    QueueUrl: `${baseURL}${queueName}`,
    MessageBody: JSON.stringify(data),
  };

  return sqs.sendMessage(params).promise();
};

const initQueues = async () => {
  const promises = [];
  queueNames.forEach((queueName) => promises.push(createQueue(queueName)));

  await Promise.all(promises);
  console.log("all queues initialized");
};

const produceMessages = async (queueName) => {
  const promises = [];

  const amount = 10;
  for (let i = 0; i < amount; i += 1) {
    const data = {
      id: `message: ${queueName}-${i}`,
    };

    promises.push(sendMessage(queueName, data));
  }

  await Promise.all(promises);
  console.log(`sent ${amount} messages to ${queueName}`);
};

const main = async () => {
  await initQueues();

  for (const queueName of queueNames) {
    await produceMessages(queueName);
  }

  console.log("done");
};

main();

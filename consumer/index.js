const AWS = require("aws-sdk");
const dotenv = require("dotenv");

const queues = require("./queues.json");

dotenv.config();

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const baseURL = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT}/`;

const receiveMessages = async (queueName, batchsize) => {
  const params = {
    QueueUrl: `${baseURL}${queueName}`,
    MaxNumberOfMessages: batchsize,
  };

  return sqs.receiveMessage(params).promise();
};

const deleteMessages = async (queueName, messages) => {
  const entries = messages.map((message) => {
    return { Id: message.MessageId, ReceiptHandle: message.ReceiptHandle };
  });

  const params = {
    QueueUrl: `${baseURL}${queueName}`,
    Entries: entries,
  };

  return sqs.deleteMessageBatch(params).promise();
};

const processMessages = async (messages) => {
  messages.forEach((message) => console.log(message.Body));
};

const pollMessages = async (queue) => {
  const data = await receiveMessages(queue.name, queue.batchsize);
  if (!data.Messages) return;

  await processMessages(data.Messages);

  deleteMessages(queue.name, data.Messages);
};

const main = async () => {
  const promises = [];
  for (const queue of queues) {
    promises.push(pollMessages(queue));
  }

  await Promise.all(promises);
};

main();
